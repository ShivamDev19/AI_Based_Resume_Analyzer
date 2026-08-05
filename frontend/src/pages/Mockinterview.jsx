import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const speak = (text, onEnd) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = "en-IN";
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
};

const PHASES = {
    SETUP: "setup",
    INTERVIEWING: "interviewing",
    FINISHED: "finished",
};

export default function MockInterview() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [loadingStart, setLoadingStart] = useState(false);

    const [phase, setPhase] = useState(PHASES.SETUP);
    const [interviewId, setInterviewId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState([]);

    const [result, setResult] = useState(null);
    const [finishing, setFinishing] = useState(false);

    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);   // FIX — stale closure problem solve
    const transcriptRef = useRef("");        // FIX — transcript accumulate properly

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await fetch(`${BASE_URL}/resume/my-resumes`, {
                    headers: { token },
                });
                const data = await res.json();
                const parsed = (data.resumes || []).filter((r) => r.pdf_content);
                setResumes(parsed);
            } catch (err) {
                console.error(err);
            }
        };
        fetchResumes();
    }, []);

    // FIX — recognition properly setup with auto-restart
    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Chrome use karo — Web Speech API sirf Chrome mein kaam karta hai.");
            return;
        }

        transcriptRef.current = "";
        setTranscript("");

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let finalText = "";
            let interimText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += t;
                } else {
                    interimText += t;
                }
            }

            // FIX — final text ref mein accumulate karo, interim alag dikhao
            if (finalText) {
                transcriptRef.current += finalText + " ";
            }
            setTranscript(transcriptRef.current + interimText);
        };

        // FIX — auto restart on pause (browser silence detection pe stop karta hai)
        recognition.onend = () => {
            if (isListeningRef.current) {
                try {
                    recognition.start(); // restart if user ne manually stop nahi kiya
                } catch (e) {
                    console.log("Restart failed:", e);
                }
            } else {
                setIsListening(false);
            }
        };

        recognition.onerror = (e) => {
            if (e.error === "no-speech") return; // ignore — restart hoga automatically
            if (e.error === "aborted") return;   // ignore — manual stop
            console.error("Recognition error:", e.error);
        };

        recognitionRef.current = recognition;
        recognition.start();
        isListeningRef.current = true;
        setIsListening(true);
    };

    const stopListening = () => {
        isListeningRef.current = false;
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const toggleMic = () => {
        if (isListeningRef.current) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleStart = async () => {
        if (!selectedResume || !jobDescription.trim()) {
            alert("Resume aur Job Description dono select karo.");
            return;
        }
        setLoadingStart(true);
        try {
            const res = await fetch(`${BASE_URL}/interview/start`, {
                method: "POST",
                headers: { token, "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_id: selectedResume,
                    job_description: jobDescription,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setInterviewId(data.interview_id);
            setQuestions(data.questions);
            setPhase(PHASES.INTERVIEWING);

            setTimeout(() => askQuestion(data.questions[0], 0), 500);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoadingStart(false);
        }
    };

    const askQuestion = (question, index) => {
        setIsSpeaking(true);
        transcriptRef.current = "";
        setTranscript("");
        speak(`Question ${index + 1}. ${question}`, () => {
            setIsSpeaking(false);
        });
    };

    const handleSubmitAnswer = async () => {
        const finalAnswer = transcriptRef.current.trim();
        if (!finalAnswer) {
            alert("Pehle mic pe answer do.");
            return;
        }
        stopListening();
        setSubmitting(true);

        try {
            const res = await fetch(`${BASE_URL}/interview/${interviewId}/submit-answer`, {
                method: "POST",
                headers: { token, "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: questions[currentIndex],
                    userAnswer: finalAnswer,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setAnswers((prev) => [
                ...prev,
                {
                    question: questions[currentIndex],
                    answer: finalAnswer,
                    score: data.evaluation.score,
                    feedback: data.evaluation.feedback,
                },
            ]);

            speak(
                `Score: ${data.evaluation.score} out of 10. ${data.evaluation.feedback}`,
                () => {
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < questions.length) {
                        setCurrentIndex(nextIndex);
                        transcriptRef.current = "";
                        setTranscript("");
                        setTimeout(() => askQuestion(questions[nextIndex], nextIndex), 800);
                    } else {
                        speak("Great! All questions done. Generating your final report...", () => {
                            handleFinish();
                        });
                    }
                }
            );
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinish = async () => {
        setFinishing(true);
        try {
            const res = await fetch(`${BASE_URL}/interview/${interviewId}/finish`, {
                method: "POST",
                headers: { token, "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setResult(data);
            setPhase(PHASES.FINISHED);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setFinishing(false);
        }
    };

    const scoreColor = (score) => {
        if (score >= 7) return "text-green-400";
        if (score >= 5) return "text-yellow-400";
        return "text-red-400";
    };

    // ── SETUP PHASE ────────────────────────────────────────────────────────────
    if (phase === PHASES.SETUP) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-xl bg-gray-900 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold text-blue-400 mb-1">🎙️ AI Mock Interview</h1>
                    <p className="text-gray-400 text-sm mb-6">
                        Resume + JD select karo — AI voice interview lega
                    </p>

                    <label className="block text-sm text-gray-400 mb-1">Select Resume</label>
                    <select
                        value={selectedResume}
                        onChange={(e) => setSelectedResume(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">-- Resume choose karo --</option>
                        {resumes.map((r) => (
                            <option key={r._id} value={r._id}>
                                {r.originalName}
                            </option>
                        ))}
                    </select>
                    {resumes.length === 0 && (
                        <p className="text-xs text-yellow-400 mb-4">
                            ⚠️ Koi parsed resume nahi mila. Pehle Dashboard mein resume upload aur parse karo.
                        </p>
                    )}

                    <label className="block text-sm text-gray-400 mb-1">Job Description</label>
                    <textarea
                        rows={6}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Job description paste karo..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-6 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    />

                    <button
                        onClick={handleStart}
                        disabled={loadingStart}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                    >
                        {loadingStart ? "Questions generate ho rahe hain..." : "🚀 Start Interview"}
                    </button>
                </div>
            </div>
        );
    }

    // ── INTERVIEW PHASE ────────────────────────────────────────────────────────
    if (phase === PHASES.INTERVIEWING) {
        const progress = Math.round((answers.length / questions.length) * 100);
        

        return (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-2xl">

                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Question {Math.min(currentIndex + 1, questions.length)} / {questions.length}</span>
                            <span>{progress}% complete</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 mb-6 shadow-xl border border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                Q{currentIndex + 1}
                            </span>
                            {isSpeaking && (
                                <span className="text-blue-400 text-xs animate-pulse">🔊 AI bol raha hai...</span>
                            )}
                        </div>
                        <p className="text-white text-lg leading-relaxed">
                            {questions[currentIndex]}
                        </p>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800 min-h-[100px]">
                        <p className="text-xs text-gray-500 mb-2">Your Answer (Live Transcript)</p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                            {transcript || (isListening ? "🎤 Sun raha hoon... bol!" : "Mic button press karo aur bolo...")}
                        </p>
                    </div>
                    

                    <div className="flex gap-4">
                        <button
                            onClick={toggleMic}
                            disabled={isSpeaking || submitting}
                            className={`flex-1 py-4 rounded-xl font-semibold text-white transition text-lg
                                ${isListening
                                    ? "bg-red-600 hover:bg-red-700 animate-pulse"
                                    : "bg-gray-700 hover:bg-gray-600"
                                } disabled:opacity-40`}
                        >
                            {isListening ? "🔴 Stop Recording" : "🎤 Start Recording"}
                        </button>

                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!transcript.trim() || submitting || isSpeaking}
                            className="flex-1 py-4 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-40"
                        >
                            {submitting ? "Evaluating..." : "✅ Submit Answer"}
                        </button>
                    </div>

                    {answers.length > 0 && (
                        <div className="mt-8">
                            <p className="text-gray-400 text-sm mb-3">Answered Questions</p>
                            <div className="space-y-3">
                                {answers.map((a, i) => (
                                    <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm text-gray-300 font-medium">Q{i + 1}: {a.question}</p>
                                            <span className={`text-sm font-bold ${scoreColor(a.score)}`}>{a.score}/10</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{a.feedback}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── FINISHED PHASE ─────────────────────────────────────────────────────────
    if (phase === PHASES.FINISHED) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-2xl">

                    <div className="bg-gray-900 rounded-2xl p-8 mb-6 text-center border border-gray-800 shadow-2xl">
                        <p className="text-gray-400 text-sm mb-2">Final Score</p>
                        <p className={`text-6xl font-bold mb-2 ${scoreColor(result?.final_score)}`}>
                            {result?.final_score}/10
                        </p>
                        <p className="text-gray-400 text-sm">
                            {result?.final_score >= 7
                                ? "🎉 Great Performance!"
                                : result?.final_score >= 5
                                ? "👍 Decent — Keep Practicing"
                                : "💪 Needs More Preparation"}
                        </p>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
                        <p className="text-blue-400 font-semibold mb-3">📋 AI Feedback</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {result?.feedback}
                        </p>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
                        <p className="text-blue-400 font-semibold mb-4">📊 Answer Breakdown</p>
                        <div className="space-y-4">
                            {result?.answers?.map((a, i) => (
                                <div key={i} className="border-b border-gray-800 pb-4 last:border-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm text-white font-medium">Q{i + 1}: {a.question}</p>
                                        <span className={`text-sm font-bold ${scoreColor(a.score)}`}>{a.score}/10</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-1">Your answer: {a.userAnswer}</p>
                                    <p className="text-xs text-gray-500">Feedback: {a.aiFeedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setPhase(PHASES.SETUP);
                                setAnswers([]);
                                setQuestions([]);
                                setCurrentIndex(0);
                                setTranscript("");
                                transcriptRef.current = "";
                                setResult(null);
                            }}
                            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold transition"
                        >
                            🔄 New Interview
                        </button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 font-semibold transition"
                        >
                            🏠 Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (finishing) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
                <p className="text-xl animate-pulse">⏳ Generating your report...</p>
            </div>
        );
    }
}