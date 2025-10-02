# miniHealthHelper - Nutrition, Symptoms & Remedies

A comprehensive Next.js health tracking application that combines nutrition logging, symptom prediction, exercise tracking, and personalized remedy recommendations using ML-based insights.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jonnyterreros-projects/v0-nutrition-symptoms-and-remedies)

## 🌟 Features

### 1. **Nutrition & Symptom Tracker**
- Log meals with detailed information (foods, caffeine, timing)
- Track sleep hours and stress levels
- Record symptoms and their severity
- Identify patterns between nutrition and symptoms

### 2. **ML-Based Predictions**
- AI-powered symptom predictions based on lifestyle factors
- Real-time risk assessment for:
  - Acid Reflux
  - Migraines
  - IBS Symptoms
  - Skin Issues
- Example predictions: "Coffee + <6 hrs sleep = 50% chance of reflux"
- 7-day trend analysis with visualizations
- Factor-symptom correlation charts

### 3. **Exercise & Recovery Tracker**
- Log workouts with type, duration, and intensity
- Track recovery feelings
- Import data from wearables (CSV format)
- Monitor how exercise impacts symptoms
- Supports Fitbit/Apple Watch CSV imports

### 4. **Personalized Remedy Recommender**
- Track effectiveness of medications, supplements, lifestyle changes, and foods
- Rate remedies with thumbs up/down feedback
- Automatic effectiveness scoring
- Sort by effectiveness or usage frequency
- Multi-condition support (IBS, migraines, skin issues, reflux)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/jonnyterreros-projects/v0-nutrition-symptoms-and-remedies.git
cd v0-nutrition-symptoms-and-remedies
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 How It Works

### Prediction Algorithm

The app uses a rule-based ML model that analyzes:

- **Sleep Patterns**: Poor sleep (<6 hrs) increases reflux & migraine risk by 25-30%
- **Caffeine + Sleep**: Coffee with insufficient sleep = 50%+ reflux probability
- **Stress Levels**: High stress (7+) significantly impacts IBS symptoms
- **Exercise**: Regular activity provides 10-15% protective effect

### Data Storage

- All data is stored locally in your browser's localStorage
- No data is sent to external servers
- Export/import functionality for data portability

### CSV Import Format

For wearable data import, use this format:
\`\`\`csv
date,type,duration,intensity
2024-01-01,Running,30,medium
2024-01-02,Yoga,45,low
2024-01-03,Weights,60,high
\`\`\`

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📱 Pages

- **Dashboard** (`/`) - Overview with quick stats and today's predictions
- **Nutrition** (`/nutrition`) - Track meals and symptoms
- **Exercise** (`/exercise`) - Log workouts and recovery
- **Predictions** (`/predictions`) - AI predictions and trend analysis
- **Remedies** (`/remedies`) - Track remedy effectiveness

## 🔮 Future Enhancements

- [ ] Advanced ML with collaborative filtering
- [ ] Cloud sync and multi-device support
- [ ] More wearable integrations (direct API connections)
- [ ] Food image recognition
- [ ] Community insights (anonymized patterns)
- [ ] Export reports as PDF
- [ ] Dark mode support

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the repository.
