# Iudicium: AI-Powered Candidate Evaluation System

## 🏆 Anti-Corruption Hackathon Project

**Iudicium** (Latin for "judgment," "assessment") is an  application designed to provide **fast, transparent, and objective evaluation** of candidates applying for public, government, and other critical positions. The system minimizes the risks of corruption, subjective influence, and bias by delivering an **independent, data-driven verdict** on a candidate's suitability.

## ✨ Overview and Objective

The core mission of Iudicium is to provide a transparent and in-depth analysis of a candidate's profile, leveraging **Artificial Intelligence (AI)** capabilities to detect potential risks, including:

1.  Potential **Conflicts of Interest**.
2.  **Competency Mismatches** for the stated position.
3.  Overall **Integrity** and profile consistency.

## 🚀 Key Features

The system processes structured candidate data files (like CSV) and generates a detailed analytical report:

* **Data Ingestion:** Accepts structured candidate profile files (e.g., CSV, JSON).
* **Deep AI Analysis:** The **Gemma 3 (12B) model** processes the input data to form a **Comprehensive Candidate Profile** (similar to the structure provided in the data sample).
* **Detailed Scoring:** Determines key metrics, including:
    * `evaluation_trust_score` and `evaluation_integrity_score` (Trust and Integrity Score).
    * `evaluation_leadership_maturity_score` (Leadership Maturity Score).
    * `position_relevance_overall_score` (Overall Position Relevance).
* **Risk Analysis Generation:** Creates a dedicated **Risk Analysis** section flagging potential issues (`risk_analysis_notes`, `risk_analysis_conflict_of_interest`, etc.).
* **Final Conclusion:** Generates an integral assessment (`summary_conclusion`) that determines **"how the candidate will fit the position."**

## 🛠️ Technological Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React** (with **Vite**) | A modern, fast user interface for data upload and report viewing. |
| **Backend/API** | **Python** | The core application logic, data processing, and AI model orchestration. |
| **AI Model** | **Gemma 3 (12B)** | A powerful large language model used for deep, contextual analysis of candidate profiles. |
| **Database** | **PostgreSQL** | Robust, open-source relational database for storing processed data and application state. |
| **File Storage** | **MinIO** | High-performance, S3-compatible object storage for securely handling large candidate files and reports. |

## 📝 Installation and Setup

### Prerequisites

You must have **Docker** and **Docker Compose** installed on your system.

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone [INSERT REPOSITORY LINK HERE]
    cd iudicium
    ```

2.  **Configuration:**
    * Create an environment file: `cp .env.example .env`
    * Edit the `.env` file to configure **PostgreSQL** credentials, **MinIO** access keys, and the **Gemma 3 API endpoint/configuration**.

3.  **Install Python Dependencies:**
    * *Since the full list of dependencies was not provided, you will typically use:*
    ```bash
    # Ensure all required Python packages are installed
    pip install -r requirements.txt 
    ```

4.  **Launch the System (Recommended via Docker Compose):**
    This command will build the images (Frontend, Backend, MinIO, PostgreSQL) and run the entire stack.
    ```bash
    docker-compose up --build -d
    ```

5.  **Access:**
    The application will be accessible at `http://localhost:[PORT]` (check your Docker configuration for the frontend port, typically 3000 or 5173 for Vite).

## 💡 Usage

1.  Launch the application using the instructions above.
2.  Navigate to the web interface.
3.  Upload the structured candidate data file (e.g., a CSV file like the `Устинов_Дмитро.csv` sample).
4.  The system will process the file, run the **Gemma 3** model for analysis, and store the result in **PostgreSQL** and the original file in **MinIO**.
5.  View the detailed analytical report on the screen, featuring all scores and the summary conclusion.

## 🤝 Contributing

We welcome contributions! To get involved:

1.  **Fork** the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to your branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.


