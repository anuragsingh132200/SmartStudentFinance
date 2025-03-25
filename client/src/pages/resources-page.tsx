import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Define resource categories and resources
const resourceCategories = [
  "All",
  "Budgeting",
  "Student Loans",
  "Banking",
  "Saving",
  "Jobs",
  "Taxes"
];

interface Resource {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  icon: string;
  featured?: boolean;
}

const resources: Resource[] = [
  {
    id: 1,
    title: "Student Loan Management",
    description: "Learn strategies to manage your student loans effectively",
    content: "Student loans can be overwhelming, but with the right plan, you can manage them effectively. This guide covers understanding loan types, repayment options, and strategies for minimizing interest while staying on track with payments.",
    category: "Student Loans",
    icon: "school",
    featured: true
  },
  {
    id: 2,
    title: "Budgeting 101",
    description: "Essential budgeting tips for international students",
    content: "Creating a budget is the first step toward financial independence. This guide teaches you how to track income and expenses, set realistic spending limits, use budgeting apps, and adjust your budget as your situation changes.",
    category: "Budgeting",
    icon: "calculate",
    featured: true
  },
  {
    id: 3,
    title: "Campus Job Guide",
    description: "Finding and balancing work opportunities while studying",
    content: "Campus jobs can provide valuable income and experience. Learn about where to find job postings, how to apply effectively, what rights you have as an international student worker, and how to balance work with your studies.",
    category: "Jobs",
    icon: "work",
    featured: true
  },
  {
    id: 4,
    title: "Saving Strategies",
    description: "Smart ways to build savings on a student budget",
    content: "Even with limited income, you can build savings through consistent habits. This resource covers setting up emergency funds, automating savings, finding student discounts, and planning for both short and long-term financial goals.",
    category: "Saving",
    icon: "savings",
    featured: true
  },
  {
    id: 5,
    title: "Understanding Banking in the US",
    description: "Banking essentials for international students",
    content: "Navigating the U.S. banking system can be confusing. Learn about different account types, avoiding fees, building credit safely, and using digital banking tools to manage your finances from anywhere.",
    category: "Banking",
    icon: "account_balance",
  },
  {
    id: 6,
    title: "Tax Guidelines for International Students",
    description: "Navigate tax filing requirements and potential deductions",
    content: "International students often have unique tax situations. This guide explains your tax obligations, which forms to file, important deadlines, available tax treaties, and deductions that may apply to your situation.",
    category: "Taxes",
    icon: "receipt_long",
  },
  {
    id: 7,
    title: "Building Credit in the US",
    description: "Establish and maintain good credit as an international student",
    content: "Good credit opens doors to better financial opportunities. Learn how to start building credit with secured cards, understand credit scores, avoid common mistakes, and monitor your credit health.",
    category: "Banking",
    icon: "credit_card",
  },
  {
    id: 8,
    title: "Grocery Shopping on a Budget",
    description: "Strategies to save money on food without sacrificing nutrition",
    content: "Food expenses can quickly add up. Discover practical tips for meal planning, where to find student discounts, how to use coupons effectively, and which budget-friendly staples to keep on hand.",
    category: "Budgeting",
    icon: "shopping_basket",
  },
  {
    id: 9,
    title: "Emergency Fund Basics",
    description: "Why and how to build a financial safety net",
    content: "Unexpected expenses happen to everyone. This guide explains how to determine your emergency fund goal, where to keep these funds, and how to rebuild your safety net after using it.",
    category: "Saving",
    icon: "health_and_safety",
  },
  {
    id: 10,
    title: "Financial Aid for International Students",
    description: "Scholarships, grants and aid opportunities",
    content: "While options may be more limited, financial aid does exist for international students. Learn about scholarships specifically for international students, how to search effectively, and tips for strong applications.",
    category: "Student Loans",
    icon: "paid",
  }
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Filter resources based on search query and active category
  const filteredResources = resources.filter(resource => 
    (activeCategory === "All" || resource.category === activeCategory) &&
    (resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get featured resources
  const featuredResources = resources.filter(resource => resource.featured);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <Header title="Financial Resources" subtitle="Educational materials to improve your financial literacy" />
        
        <div className="p-4 md:p-8">
          {/* Search and filter */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative w-full md:max-w-xs">
              <Input
                type="text"
                placeholder="Search resources..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-icons absolute right-3 top-2 text-gray-400">search</span>
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2">
                {resourceCategories.map(category => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          {selectedResource ? (
            <div className="bg-white rounded-xl shadow-sm mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedResource(null)}
                    className="mr-2"
                  >
                    <span className="material-icons text-gray-500 mr-1">arrow_back</span>
                    Back
                  </Button>
                  <span className={`material-icons text-primary p-2 bg-blue-50 rounded-lg mr-3`}>
                    {selectedResource.icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{selectedResource.title}</h2>
                    <p className="text-sm text-gray-500">{selectedResource.category}</p>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-4">{selectedResource.description}</p>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Overview</h3>
                    <p className="text-gray-700">{selectedResource.content}</p>
                  </div>
                  
                  {/* This is placeholder content - in a real app, this would be actual content */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Key Points</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Understand your financial situation and set realistic goals</li>
                      <li>Create a plan that works for your specific circumstances</li>
                      <li>Track your progress regularly and make adjustments as needed</li>
                      <li>Take advantage of available resources and tools</li>
                      <li>Don't hesitate to seek professional advice when necessary</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">tips_and_updates</span>
                      Pro Tip
                    </h3>
                    <p className="text-gray-700">
                      Start small and build consistent habits. Financial management is a marathon, not a sprint!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.length > 0 ? (
                    filteredResources.map(resource => (
                      <Card 
                        key={resource.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start">
                            <div className="p-2 bg-blue-50 rounded-lg mr-3">
                              <span className="material-icons text-primary">{resource.icon}</span>
                            </div>
                            <div>
                              <CardTitle className="text-base">{resource.title}</CardTitle>
                              <CardDescription>{resource.category}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">{resource.description}</p>
                          <div className="flex items-center mt-3 text-primary text-sm font-medium">
                            <span>Read More</span>
                            <span className="material-icons ml-1" style={{ fontSize: "16px" }}>arrow_forward</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center bg-white rounded-xl shadow-sm">
                      <span className="material-icons text-gray-400 text-3xl mb-2">menu_book</span>
                      <p className="text-gray-500">No resources found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="featured">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredResources.map(resource => (
                    <Card 
                      key={resource.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
                      onClick={() => setSelectedResource(resource)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start">
                          <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <span className="material-icons text-primary">{resource.icon}</span>
                          </div>
                          <div>
                            <CardTitle className="text-base">{resource.title}</CardTitle>
                            <CardDescription>{resource.category}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                        <div className="flex items-center mt-3 text-primary text-sm font-medium">
                          <span>Read More</span>
                          <span className="material-icons ml-1" style={{ fontSize: "16px" }}>arrow_forward</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {/* Additional Resources Section */}
          {!selectedResource && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">External Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href="#" 
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <span className="material-icons text-purple-600">school</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">University Financial Aid Office</h3>
                      <p className="text-xs text-gray-500">Resources specific to your institution</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="material-icons text-blue-600">account_balance</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Consumer Financial Protection Bureau</h3>
                      <p className="text-xs text-gray-500">Official financial education resources</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="material-icons text-green-600">savings</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">International Student Scholarships</h3>
                      <p className="text-xs text-gray-500">Database of scholarship opportunities</p>
                    </div>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <span className="material-icons text-amber-600">local_library</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Financial Literacy Courses</h3>
                      <p className="text-xs text-gray-500">Free online courses on personal finance</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}
