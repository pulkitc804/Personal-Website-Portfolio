"""Static portfolio payloads — swap for DB or model outputs later."""

PROFILE = {
    "name": "Pulkit Chaudhary",
    "headline": (
        "B.S. in Data Science, Computer Science, Mathematics & Statistics "
        "at Rutgers University"
    ),
    "gpa": "4.0 / 4.0",
    "coursework": [
        "Probability Theory",
        "Multivariable Calculus",
        "Data Structures",
        "Linear Algebra",
    ],
    "linkedin_url": "https://www.linkedin.com/in/pc804",
    "github_url": "https://github.com/pulkitc804",
}

EXPERIENCE = [
    {
        "id": "ds101",
        "title": "Part-Time Data Science Lecturer (Data 101)",
        "org": "Rutgers University",
        "period": "Present",
        "bullets": [
            "Selected as the sole freshman lecturer; orchestrated R programming "
            "recitations for 40+ undergraduates.",
            "Evaluated 250+ submissions monthly with a 100% on-time SLA.",
        ],
        "metrics": ["+20% engagement", "250+ submissions / mo", "100% SLA"],
    },
    {
        "id": "rqfc",
        "title": "Quantitative Researcher",
        "org": "Rutgers Quantitative Finance Club",
        "period": "Present",
        "bullets": [
            "Spearheaded SABR stochastic volatility model research and nonlinear "
            "least-squares calibration.",
            "Benchmarked across 500+ simulated option chains.",
        ],
        "metrics": ["500+ chains", "<2 bps pricing error"],
    },
    {
        "id": "rdsc",
        "title": "Lead Events Manager",
        "org": "Rutgers Data Science Club",
        "period": "Present",
        "bullets": [
            "Directed datathons and programming events for 100+ members.",
            "Streamlined planning workflows to reduce overhead.",
        ],
        "metrics": ["100+ members", "−30% planning overhead"],
    },
]

PROJECTS = [
    {
        "id": "guardian",
        "title": "HackPrinceton — Guardian (SOS)",
        "subtitle": "Biomechanics + on-device ML + voice AI",
        "tags": ["CoreML", "Swift", "Firebase", "ElevenLabs", "Apple TTS"],
        "description": (
            "Predictive CoreML model and AI reasoning layer (K2 Think) to analyze "
            "biomechanical anomalies and reduce elderly fall risk, with a "
            "generative voice pipeline."
        ),
        "highlights": [
            "CoreML predictive model + AI reasoning for gait anomalies",
            "Generative AI voice via ElevenLabs + Apple TTS",
            "Swift / Firebase ecosystem for real-time safety workflows",
        ],
    },
    {
        "id": "solar-telemetry",
        "title": "Rutgers Solar Car — Telemetry Dashboard",
        "subtitle": "High-throughput sensor ingestion + Dash",
        "tags": ["Python", "Pandas", "Dash", "Plotly"],
        "description": (
            "Python ingestion pipeline for 10,000+ sensor records/sec with "
            "vectorized transforms and interactive visualization."
        ),
        "highlights": [
            "10,000+ records/sec ingestion architecture",
            "Pandas vectorization cut processing latency by 25%",
            "Interactive Dash / Plotly operational suite",
        ],
    },
    {
        "id": "portfolio-opt",
        "title": "AI-SDE Portfolio Optimization Engine",
        "subtitle": "SDEs × deep learning × Monte Carlo",
        "tags": ["PyTorch", "Streamlit", "Monte Carlo", "SDE"],
        "description": (
            "PyTorch engine fusing stochastic differential equations with deep "
            "learning for portfolio dynamics and risk-aware simulation."
        ),
        "highlights": [
            "2,000+ simulated price paths/sec throughput",
            "Live Streamlit dashboard for experiments and metrics",
            "Unified SDE + neural calibration stack (placeholder for your models)",
        ],
    },
]

SKILLS = {
    "languages_tools": [
        "Python",
        "Swift",
        "Java",
        "R",
        "Git",
        "NumPy",
        "Pandas",
        "Scikit-learn",
        "TensorFlow",
        "PyTorch",
        "Firebase",
        "CoreML",
    ],
    "awards": [
        "2nd Place — Jane Street Estimathon",
        "Dean's List",
    ],
    "certifications": [
        "AWS Cloud Practitioner (In Progress)",
    ],
}
