import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Code, Award, GraduationCap, Wrench, Star } from 'lucide-react';
import backend from '~backend/client';
import type { ProfileData } from '~backend/profile/get_profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillsAnimated, setSkillsAnimated] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await backend.profile.getProfile();
        setProfileData(data);
        // Trigger skills animation after data loads
        setTimeout(() => setSkillsAnimated(true), 500);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getSkillColor = (percentage: number) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-400';
    if (percentage >= 80) return 'from-blue-500 to-cyan-400';
    if (percentage >= 70) return 'from-yellow-500 to-orange-400';
    if (percentage >= 60) return 'from-orange-500 to-red-400';
    return 'from-red-500 to-pink-400';
  };

  const getSkillLevel = (percentage: number) => {
    if (percentage >= 90) return 'Expert';
    if (percentage >= 80) return 'Advanced';
    if (percentage >= 70) return 'Intermediate';
    if (percentage >= 60) return 'Beginner';
    return 'Learning';
  };

  const SkillBar = ({ skill, index }: { skill: any; index: number }) => (
    <div 
      className="group hover:scale-105 transition-all duration-300 p-4 rounded-xl bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-600/30 hover:border-teal-500/50"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-white font-medium text-sm">{skill.name}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-teal-400 font-bold text-lg">{skill.percentage}%</span>
            <Badge 
              variant="secondary" 
              className={`text-xs px-2 py-1 bg-gradient-to-r ${getSkillColor(skill.percentage)} text-white border-0`}
            >
              {getSkillLevel(skill.percentage)}
            </Badge>
          </div>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(skill.percentage / 20) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getSkillColor(skill.percentage)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
            style={{
              width: skillsAnimated ? `${skill.percentage}%` : '0%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        <div 
          className="absolute top-0 h-3 w-1 bg-white/60 rounded-full transition-all duration-1000 ease-out"
          style={{
            left: skillsAnimated ? `${skill.percentage}%` : '0%',
            transform: 'translateX(-50%)',
          }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  const { profile, skills, education, certificates, tools } = profileData;

  // Separate skills by category
  const generalSkills = skills.filter(skill => skill.category !== 'management');
  const managementSkills = skills.filter(skill => skill.category === 'management');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {/* Enhanced Profile Photo */}
                  <div className="relative group mx-auto mb-6">
                    <div className="w-48 h-48 mx-auto relative">
                      {/* Animated border rings */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 animate-spin-slow p-1">
                        <div className="w-full h-full rounded-full bg-gray-900"></div>
                      </div>
                      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-teal-400 animate-spin-reverse p-1">
                        <div className="w-full h-full rounded-full bg-gray-800"></div>
                      </div>
                      
                      {/* Profile image container */}
                      <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-gray-700 group-hover:border-teal-500 transition-all duration-300">
                        <img
                          src={profile.photoUrl || "/api/placeholder/192/192"}
                          alt={profile.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                          style={{ imageRendering: 'crisp-edges' }}
                        />
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-teal-400 rounded-full animate-float opacity-60"
                            style={{
                              left: `${20 + i * 15}%`,
                              top: `${10 + (i % 2) * 80}%`,
                              animationDelay: `${i * 0.5}s`,
                              animationDuration: `${3 + i * 0.5}s`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {profile.name}
                    </h1>
                    <p className="text-teal-400 mb-4 font-medium">{profile.title}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <Mail className="w-5 h-5 text-teal-400" />
                    <span className="break-all">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <Phone className="w-5 h-5 text-teal-400" />
                    <span>{profile.phone}</span>
                  </div>
                </div>

                {/* Enhanced Skills Section */}
                {generalSkills.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">Technical Skills</h2>
                    </div>
                    <div className="space-y-4">
                      {generalSkills.map((skill, index) => (
                        <SkillBar key={skill.id} skill={skill} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Management Skills */}
                {managementSkills.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">Manajemen SDM</h2>
                    </div>
                    <div className="space-y-4">
                      {managementSkills.map((skill, index) => (
                        <SkillBar key={skill.id} skill={skill} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Tools */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  My Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {tools.map((tool, index) => (
                    <Badge 
                      key={tool.id} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 text-teal-300 border border-teal-600/30 hover:border-teal-400 transition-all duration-300 hover:scale-105 px-4 py-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {tool.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div 
                      key={edu.id} 
                      className="border-l-4 border-teal-400 pl-6 py-3 bg-gradient-to-r from-gray-700/20 to-transparent rounded-r-lg hover:from-gray-700/40 transition-all duration-300"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <h3 className="font-semibold text-white text-lg">{edu.institution}</h3>
                      <p className="text-gray-400">{edu.location}</p>
                      <p className="text-teal-400 text-sm font-medium">{edu.startYear} - {edu.endYear}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {certificates.map((cert, index) => (
                    <div 
                      key={cert.id} 
                      className="bg-gradient-to-r from-gray-700/30 to-gray-600/20 rounded-xl p-6 border border-gray-600/30 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <h3 className="font-semibold text-white mb-3 text-lg">{cert.title}</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-300 font-medium">{cert.issuer}</span>
                      </div>
                      {cert.description && (
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{cert.description}</p>
                      )}
                      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white text-center py-3 rounded-lg text-sm font-medium">
                        Terbit {cert.issueDate}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Admin Link */}
      <div className="fixed bottom-6 right-6">
        <a
          href="/admin"
          className="group bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Admin Login
        </a>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
