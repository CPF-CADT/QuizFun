import { useEffect, useRef, type ReactElement } from "react";
import Header from "../components/homepage/Header";
import Footer from "../components/homepage/Footer";
// --- Type Definitions ---
interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  linkedin: string;
}

type IconName =
  | "Target"
  | "Eye"
  | "Send"
  | "Linkedin"
  | "ClipboardList"
  | "Code2"
  | "Network"
  | "Star"
  | "Rocket";

interface TimelineItem {
  week: string;
  title: string;
  details: string;
  icon: IconName;
}

interface IconProps {
  name: IconName;
  className?: string;
}

// --- Helper Data ---
// Expanded details for a more professional presentation
const teamMembers: TeamMember[] = [
  {
    name: "Phy Vatthanak",
    role: "Team Lead & Backend / System Design",
    imageUrl: "https://placehold.co/400x400/3b82f6/ffffff?text=PV",
    bio: "Handles real-time communication during gameplay, designs system architecture, RESTful APIs for reports, analytics, quizzes, history, and oversees DevOps & security.",
    linkedin: "#",
  },
  {
    name: "Cheng Chan Panha",
    role: "Backend Developer",
    imageUrl: "https://placehold.co/400x400/3b82f6/ffffff?text=CCP",
    bio: "Improves platform features, fixes bugs, enhances quizzes, implements Redis caching, and maintains RESTful APIs.",
    linkedin: "#",
  },
  {
    name: "Long Chhun Hour",
    role: "Backend Developer",
    imageUrl: "https://placehold.co/400x400/3b82f6/ffffff?text=LCH",
    bio: "Implements PDF export for backend & frontend, Excel export, and enhances quiz features.",
    linkedin: "#",
  },
  {
    name: "Chhorn Sothea",
    role: "Database Administrator",
    imageUrl: "https://placehold.co/400x400/22c55e/ffffff?text=CS",
    bio: "Manages MongoDB, analyzes schemas, designs databases, and ensures data integrity & performance.",
    linkedin: "#",
  },
  {
    name: "Sokhalida",
    role: "Lead Frontend & UI/UX Designer",
    imageUrl: "https://placehold.co/400x400/ef4444/ffffff?text=S",
    bio: "Focuses on frontend development, translating complex ideas into clean, responsive, and accessible UI/UX designs.",
    linkedin: "#",
  },
  {
    name: "Sry Kimsour",
    role: "Frontend Developer & UI/UX",
    imageUrl: "https://placehold.co/400x400/ef4444/ffffff?text=SK",
    bio: "Works on frontend development and UI/UX, creating interactive and responsive experiences for users.",
    linkedin: "#",
  },
];


const timelineData: TimelineItem[] = [
  {
    week: "01",
    title: "Research & Design",
    details:
      "Established project goals, researched new technologies like MongoDB and Socket.io, designed core UI/UX layouts, and defined the database schema.",
    icon: "ClipboardList",
  },
  {
    week: "02",
    title: "Core Development",
    details:
      "Began frontend implementation of key pages. Developed backend RESTful APIs for authentication and CRUD operations for quizzes.",
    icon: "Code2",
  },
  {
    week: "03",
    title: "System Integration",
    details:
      "Connected the frontend gameplay UI with backend APIs, handled user validation flows, and implemented features like PDF quiz importation.",
    icon: "Network",
  },
  {
    week: "04",
    title: "Feedback & Improvement",
    details:
      "Deployed the first version for testing with real users. Focused on fixing bugs, adding features like quiz reports, and iterating based on feedback.",
    icon: "Star",
  },
  {
    week: "05",
    title: "Official Launch",
    details:
      "Finalized the user history and analytics dashboard, deployed the production version to DigitalOcean, and performed final bug fixes for a stable release.",
    icon: "Rocket",
  },
];

// --- Icon Components (Lucide SVG) ---
const Icon = ({ name, className = "w-6 h-6" }: IconProps): ReactElement => {
  const icons: Record<IconName, ReactElement> = {
    Target: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
    Eye: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    Send: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m22 2-7 20-4-9-9-4Z"></path>
        <path d="M22 2 11 13"></path>
      </svg>
    ),
    Linkedin: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect width="4" height="12" x="2" y="9"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
    ClipboardList: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <path d="M12 11h4"></path>
        <path d="M12 16h4"></path>
        <path d="M8 11h.01"></path>
        <path d="M8 16h.01"></path>
      </svg>
    ),
    Code2: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 16 4-4-4-4"></path>
        <path d="m6 8-4 4 4 4"></path>
        <path d="m14.5 4-5 16"></path>
      </svg>
    ),
    Network: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="16" y="16" width="6" height="6" rx="1"></rect>
        <rect x="2" y="16" width="6" height="6" rx="1"></rect>
        <rect x="9" y="2" width="6" height="6" rx="1"></rect>
        <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path>
        <path d="M12 12V8"></path>
      </svg>
    ),
    Star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
    Rocket: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05-.64-.75-2.14-1.04-3.05-.95-.9.1-2.35.6-3.05.95Z"></path>
        <path d="m12 15-3-3a9 9 0 0 1 3-13v13a9 9 0 0 1-3 3Z"></path>
        <path d="M15 12a9 9 0 0 1-3 3v-3a9 9 0 0 1 3-3Z"></path>
        <path d="M15 12a9 9 0 0 1 3-3 9 9 0 0 1-3-3v6Z"></path>
        <path d="M12 15a9 9 0 0 1-3 3 9 9 0 0 1-3-3h6Z"></path>
      </svg>
    ),
  };
  return <div className={className}>{icons[name]}</div>;
};

// --- Custom Hook for Scroll Animations ---
const useScrollFadeIn = () => {
  const elementsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-10");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      elementsRef.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (el: HTMLElement | null) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };
};

// --- Main Page Component ---
export default function App(): ReactElement {
  const fadeInRef = useScrollFadeIn();

  return (
    <>
      <Header />
      <div className="bg-gray-50 text-gray-800 font-sans">
        {/* Hero Section */}
        <header className="flex flex-col items-center py-12 px-6 bg-white border-b border-gray-200">
          {/* Logo and Title */}
          <div className="flex items-center mb-4">
            <img
              src="/image/logo.png" // update path if needed
              alt="QuizzKH Logo"
              className="h-32 mr-4"
            />
            <h1 className="text-5xl font-bold">
              <span className="text-blue-600">Quizz</span>
              <span className="text-red-500">KH</span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-center text-gray-600 text-lg max-w-2xl">
            Discover the passion, people, and process behind Cambodia's next
            favorite quiz platform.
          </p>
        </header>

        <main className="container mx-auto px-6 py-16 md:py-24 space-y-24 md:space-y-32">
          {/* 1. Mission & Vision Section */}
          <section
            ref={fadeInRef}
            className="opacity-0 translate-y-10 transition-all duration-700 ease-out"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Guiding Purpose
              </h2>
              <p className="mt-2 text-gray-600">
                What drives us to build and innovate.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Icon name="Target" className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Our Mission
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To craft an engaging, competitive, and educational quiz
                  experience that sparks curiosity and makes learning a
                  thrilling adventure for everyone.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <Icon name="Eye" className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Our Vision
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To become the definitive, go-to quiz platform in Cambodia,
                  celebrated for its quality and community, before expanding our
                  reach to learners across the globe.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Team Section */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                The Minds Behind the Magic
              </h2>
              <p className="mt-2 text-gray-600">
                A dedicated team of developers and designers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  ref={fadeInRef}
                  className="opacity-0 translate-y-10 transition-all duration-700 ease-out group bg-white p-6 rounded-2xl border border-gray-200 text-center hover:border-blue-500 hover:shadow-xl hover:-translate-y-2 transform-gpu"
                >
                  <img
                    className="w-28 h-28 rounded-full mx-auto mb-5 border-4 border-gray-200 group-hover:border-blue-500 transition-colors duration-300 object-cover"
                    src={member.imageUrl}
                    alt={member.name}
                  />
                  <h3 className="text-xl font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 min-h-[60px]">
                    {member.bio}
                  </p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-300"
                  >
                    <Icon name="Linkedin" className="w-5 h-5 mx-auto" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Timeline Section */}
          <section>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our 5-Week Development Sprint
              </h2>
              <p className="mt-2 text-gray-600">
                From a concept to a fully-functional platform.
              </p>
            </div>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
              {timelineData.map((item, index) => (
                <div
                  key={item.week}
                  ref={fadeInRef}
                  className="opacity-0 translate-y-10 transition-all duration-700 ease-out relative mb-12 flex items-center w-full"
                  style={{
                    flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                  }}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-50 border-2 border-blue-500 rounded-full flex items-center justify-center z-10">
                    <Icon name={item.icon} className="w-5 h-5 text-blue-600" />
                  </div>
                  <div
                    className={`w-[calc(50%-2.5rem)] px-4 ${
                      index % 2 === 0 ? "text-right" : "text-left"
                    }`}
                  >
                    <p className="text-sm text-gray-500 font-semibold">
                      Week {item.week}
                    </p>
                    <h3 className="font-bold text-lg text-gray-900 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Combined Story & Acknowledgement */}
          <section
            ref={fadeInRef}
            className="opacity-0 translate-y-10 transition-all duration-700 ease-out grid md:grid-cols-5 gap-8 md:gap-12 bg-blue-50/50 p-8 md:p-12 rounded-2xl border border-blue-100"
          >
            <div className="md:col-span-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed">
                QuizzKH was born from a shared vision at the Cambodia Academy of
                Digital Technology (CADT) as part of the Next-Gen Engagement
                Program, where students work on real-world projects during their
                vocation. Driven by our passion for technology and education, we
                saw an opportunity to make learning interactive, fun, and
                accessible. QuizzKH is the culmination of our collaborative
                spirit, countless hours of coding, and a dedication to creating
                something meaningful for our community.
              </p>
            </div>
            <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-blue-200 pt-6 md:pt-0 md:pl-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Acknowledgement
              </h2>
              <p className="text-gray-600 italic">
                Our journey would not have been possible without the invaluable
                guidance of our advisor, Dr. Dynil Duch. We extend our sincerest
                gratitude for his support, wisdom, and encouragement, which were
                instrumental in shaping and bringing QuizzKH to life.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16 md:mt-24">
          <div className="container mx-auto px-6 py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Connect With Us
            </h2>
            <p className="text-gray-600 my-4 max-w-md mx-auto">
              Have questions or want to follow our journey? Reach out!
            </p>
            <div className="flex justify-center items-center gap-6">
              <a
                href="#"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Icon name="Send" className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Icon name="Linkedin" className="w-6 h-6" />
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-10">
              &copy; {new Date().getFullYear()} QuizzKH. All Rights Reserved.
              Built with passion in Cambodia.
            </p>
          </div>
        </footer>
      </div>
      <Footer />
    </>
  );
}
