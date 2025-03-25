import { Link } from "wouter";

type Resource = {
  id: number;
  title: string;
  description: string;
  icon: string;
  url: string;
};

export function FinancialResources() {
  // Financial resources data (these would typically come from an API)
  const resources: Resource[] = [
    {
      id: 1,
      title: "Student Loan Management",
      description: "Learn strategies to manage your student loans effectively",
      icon: "school",
      url: "/resources/student-loans"
    },
    {
      id: 2,
      title: "Budgeting 101",
      description: "Essential budgeting tips for international students",
      icon: "calculate",
      url: "/resources/budgeting"
    },
    {
      id: 3,
      title: "Campus Job Guide",
      description: "Finding and balancing work opportunities while studying",
      icon: "work",
      url: "/resources/campus-jobs"
    },
    {
      id: 4,
      title: "Saving Strategies",
      description: "Smart ways to build savings on a student budget",
      icon: "savings",
      url: "/resources/saving"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Financial Resources</h2>
        <Link href="/resources">
          <a className="text-primary text-sm hover:underline">Browse Library</a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <Link key={resource.id} href={resource.url}>
            <a className="group p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-start">
                <div className="p-2 bg-blue-50 rounded-lg mr-3 group-hover:bg-blue-100">
                  <span className="material-icons text-primary">{resource.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800 group-hover:text-primary">{resource.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                  <p className="mt-2 text-primary text-xs font-medium flex items-center">
                    <span>Read More</span>
                    <span className="material-icons ml-1" style={{ fontSize: "14px" }}>arrow_forward</span>
                  </p>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
