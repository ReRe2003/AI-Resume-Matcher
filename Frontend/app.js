const { useState } = React;

function App() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("الرجاء اختيار ملف السيرة الذاتية (PDF) أولاً");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("job_description", jobDescription);

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("https://ai-resume-matcher-1-4px7.onrender.com", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "حدث خطأ غير متوقع في السيرفر");
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">
                    🎯 مطابِق السير الذاتية بالوظائف
                </h1>

                {/* قسم الإدخال */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">1. ارفعي السيرة الذاتية (PDF):</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="w-full text-slate-300 bg-slate-700 p-3 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">2. انسخي الوصف الوظيفي هنا (اختياري):</label>
                        <textarea
                            rows="4"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="الصقي متطلبات الشاغر الوظيفي هنا للمطابقة..."
                            className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                        ></textarea>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg cursor-pointer"
                    >
                        {loading ? "جاري التقييم والتحليل..." : "تحليل ومطابقة السيرة الذاتية"}
                    </button>
                </div>

                {/* عرض الأخطاء إن وجدت */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center mb-6">
                        {error}
                    </div>
                )}

                {/* عرض النتائج */}
                {result && (
                    <div className="space-y-6 border-t border-slate-700 pt-6">
                        {/* نسبة التوافق والتوصية */}
                        <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 text-center">
                            <h2 className="text-lg text-slate-300 mb-2">نسبة الملائمة للوظيفة</h2>
                            <div className="text-5xl font-extrabold text-green-400 mb-2">
                                {result.match_percentage || 0}%
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{result.recommendation}</p>
                        </div>

                        {/* البيانات الشخصية */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                                <span className="text-slate-400 text-xs block">الاسم:</span>
                                <span className="font-medium text-slate-200">{result.name || "غير محدد"}</span>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                                <span className="text-slate-400 text-xs block">البريد:</span>
                                <span className="font-medium text-slate-200">{result.email || "غير محدد"}</span>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                                <span className="text-slate-400 text-xs block">الهاتف:</span>
                                <span className="font-medium text-slate-200">{result.phone || "غير محدد"}</span>
                            </div>
                        </div>

                        {/* المهارات */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                <h3 className="text-sm font-semibold text-slate-300 mb-2">المهارات الموجودة:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.skills?.length > 0 ? (
                                        result.skills.map((s, i) => (
                                            <span key={i} className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-500/30">
                                                {s}
                                            </span>
                                        ))
                                    ) : <span className="text-xs text-slate-500">لا يوجد</span>}
                                </div>
                            </div>

                            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                                <h3 className="text-sm font-semibold text-slate-300 mb-2">المهارات ناقصة لتطويرها:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing_skills?.length > 0 ? (
                                        result.missing_skills.map((s, i) => (
                                            <span key={i} className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-500/30">
                                                {s}
                                            </span>
                                        ))
                                    ) : <span className="text-xs text-slate-500">لا يوجد مهارات مفقودة</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));

