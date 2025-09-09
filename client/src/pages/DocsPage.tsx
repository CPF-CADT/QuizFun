import React from "react";
import {
  Users,
  FileText,
  Upload,
  GitBranch,
  QrCode,
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  Download,
  MessageSquare,
  Gamepad2,
  Target,
  Clock,
  Zap,
  Shield,
  Star,
  Rocket,
  ArrowRight,
  CheckCircle,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";

import { useAuth } from "../context/AuthContext";

const GetStartedButton = () => {
  const { user } = useAuth();

  if (user) return null; // Hide button if logged in

  return (
    <button
      onClick={() => (window.location.href = "/Login")}
      className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 justify-center"
    >
      Get Started
      <ArrowRight className="w-5 h-5" />
    </button>
  );
};

const QuizzKHDocs: React.FC = () => {
  const hostSteps = [
    {
      title: "Create a Quiz",
      items: [
        {
          icon: <FileText className="w-6 h-6" />,
          title: "Manual Creation",
          description: "Write your own questions and answers from scratch.",
        },
        {
          icon: <Upload className="w-6 h-6" />,
          title: "Import from PDF",
          description: "Quickly upload quizzes using our template format.",
        },
        {
          icon: <GitBranch className="w-6 h-6" />,
          title: "Fork Public Quizzes",
          description: "Duplicate and customize existing public quizzes.",
        },
      ],
    },
    {
      title: "Launch the Game",
      items: [
        {
          icon: <QrCode className="w-6 h-6" />,
          title: "QR Code Sharing",
          description: "Generate QR codes for instant player access.",
        },
        {
          icon: <LinkIcon className="w-6 h-6" />,
          title: "Link Sharing",
          description: "Share direct links for easy joining.",
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: "Game Modes",
          description: "Choose between Solo Quiz or Team Quiz mode.",
        },
      ],
    },
    {
      title: "Track Teams & Players",
      items: [
        {
          icon: <BarChart3 className="w-6 h-6" />,
          title: "Live Monitoring",
          description: "Monitor individual or team progress in real-time.",
        },
        {
          icon: <TrendingUp className="w-6 h-6" />,
          title: "Performance Metrics",
          description: "Track scores, speed, and accuracy as games progress.",
        },
      ],
    },
    {
      title: "Post-Game Analytics",
      items: [
        {
          icon: <BarChart3 className="w-6 h-6" />,
          title: "Comprehensive Dashboard",
          description:
            "View pass/fail percentages, grade distributions, and player speed analysis.",
        },
        {
          icon: <Download className="w-6 h-6" />,
          title: "Export Results",
          description: "Download detailed analytics as Excel (XLS) files.",
        },
      ],
    },
    {
      title: "Collect Feedback",
      items: [
        {
          icon: <MessageSquare className="w-6 h-6" />,
          title: "Player Reviews",
          description: "Receive feedback from players after quiz completion.",
        },
        {
          icon: <Shield className="w-6 h-6" />,
          title: "Quality Control",
          description:
            "Problematic questions flagged by users are automatically removed.",
        },
      ],
    },
  ];

  const playerSteps = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "Join a Game",
      description:
        "Scan a QR code or click the host's invite link to enter the quiz room instantly.",
      step: "01",
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Play the Quiz",
      description:
        "Answer questions in real-time and collaborate with teammates in Team Mode.",
      step: "02",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Provide Feedback",
      description:
        "Rate the quiz experience or report incorrect questions to improve quality.",
      step: "03",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Track Your Progress",
      description:
        "Monitor your live score during the game and check final results and rankings.",
      step: "04",
    },
  ];

  const keyFeatures = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Multiple Creation Methods",
      description: "Manual creation, PDF import, or fork public quizzes.",
      color: "#4F46E5", // Indigo
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Flexible Game Modes",
      description: "Solo and Team Quiz modes for different experiences.",
      color: "#10B981", // Emerald
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "Easy Joining",
      description: "QR code and link-based joining system.",
      color: "#F59E0B", // Amber
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Tracking",
      description:
        "Live performance monitoring with speed and accuracy metrics.",
      color: "#EF4444", // Red
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description:
        "Comprehensive dashboard with grade distribution and player insights.",
      color: "#3B82F6", // Blue
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Quality Feedback",
      description: "Player feedback system with automatic question removal.",
      color: "#8B5CF6", // Purple
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Data Export",
      description: "Export detailed results and analytics as Excel files.",
      color: "#14B8A6", // Teal
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Setup",
      description: "Quick quiz creation and immediate game launching.",
      color: "#F97316", // Orange
    },
  ];

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm font-medium text-blue-700 border border-blue-200 mb-8">
            <Play className="w-4 h-4" />
            Interactive Learning Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-8">
            How to Use <span className="text-blue-600">Quizz</span>
            <span className="text-red-500">KH</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Master the art of creating engaging multiplayer quizzes with our
            comprehensive guide. From hosting to analytics, we've got you
            covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GetStartedButton />
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg border border-gray-300 hover:bg-blue-300transition-colors duration-200">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hosts Section */}
        <section id="hosts" className="mb-24">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-10 h-10 text-blue-600" />
              <h2 className="text-4xl font-bold text-gray-900">
                For Quiz Masters
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your ideas into engaging quiz experiences with these
              powerful tools
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-blue-200"></div>

            <div className="space-y-12">
              {hostSteps.map((step, stepIndex) => (
                <div key={stepIndex} className="relative pl-20">
                  {/* Timeline Node */}
                  <div className="absolute left-0 top-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl shadow-lg border-4 border-white">
                    {stepIndex + 1}
                  </div>

                  {/* Content Card */}
                  <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {step.title}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {step.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="text-center p-6 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                        >
                          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-xl mb-4">
                            {item.icon}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Players Section */}
        <section id="players" className="mb-24">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="w-10 h-10 text-green-600" />
              <h2 className="text-4xl font-bold text-gray-900">For Players</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join the fun in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {playerSteps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-xl mb-6">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed text-sm">
                    {step.description}
                  </p>

                  <div className="mt-6">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="mb-24">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-10 h-10 text-yellow-500" />
              <h2 className="text-4xl font-bold text-gray-900">Key Features</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create exceptional quiz experiences
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-2xl transition-shadow duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 text-white`}
                  style={{ backgroundColor: feature.color || "#4F46E5" }} // Use custom color from feature or default
                >
                  {feature.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-700 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="bg-blue-600 rounded-xl p-12 text-center text-white shadow-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Rocket className="w-4 h-4" />
              Ready to Launch?
            </div>

            <h2 className="text-4xl font-bold mb-6">Start Your Quiz Journey</h2>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of educators and trainers who are already creating
              amazing quiz experiences with QuizzKH
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={"/dashboard"}
                className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 justify-center"
              >
                <Rocket className="w-6 h-6" />
                Create Your First Quiz
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg border border-blue-500 hover:bg-blue-800 transition-colors duration-200">
                View Examples
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
    <Footer />
    </>
  );
};

export default QuizzKHDocs;
