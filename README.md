# Batumi Casino Benchmark Engine 🎰

A high-performance market intelligence tool designed to benchmark and visualize the competitive landscape of casinos in Batumi, Georgia. This application leverages the **Google Gemini 2.5 Flash API** with real-time **Google Maps grounding** to provide up-to-the-minute data on review counts and quality ratings.

## 🚀 Features

- **Real-time Market Sync**: Directly queries Google Maps for the latest venue metadata.
- **Brand Intelligence**: Identifies standalone casino entities (separating them from hotel pins) for accurate benchmarking.
- **Dynamic Visualizations**:
  - **Volume Benchmark**: Compare review counts with brand-aligned color schemes.
  - **Positioning Map**: Analyze properties across a Reach vs. Quality scatter matrix.
  - **Growth Vector**: Track historical trends with automated daily snapshots.
- **Export Capabilities**:
  - **Visual PDF Generation**: High-fidelity capture of the entire dashboard for stakeholder reporting.
  - **Link Sharing**: Share "Live" links for daily updates or "Snapshot" links for frozen historical views.
- **Dark/Light Mode**: Fully optimized UI for both professional and late-night analysis.

## 🛠️ Tech Stack

- **Framework**: React 19 (ESM)
- **Styling**: Tailwind CSS
- **Intelligence**: Google Gemini API (@google/genai)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Exports**: jsPDF & html2canvas

## 📋 Prerequisites

- A valid **Google AI Studio API Key**.
- Modern web browser with Geolocation support (optional but recommended for local accuracy).

## 🔧 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/batumi-casino-benchmark.git
   cd batumi-casino-benchmark
   ```

2. **Environment Configuration**:
   The app expects an API key. In a local development environment, ensure `process.env.API_KEY` is accessible or injected via your build tool (like Vite or Webpack).

3. **Open the App**:
   Simply open `index.html` in a local server environment.

## ⚠️ Disclaimer

This tool is for market research purposes. Data accuracy depends on the information provided by Google Maps and the grounding accuracy of the Gemini model. Ensure your API key has the necessary quotas and permissions enabled for Grounding with Google Search and Google Maps.

---
*Built with ❤️ for the Batumi Gaming Market.*