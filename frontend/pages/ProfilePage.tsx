import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Code, Award, GraduationCap, Wrench } from 'lucide-react';
import backend from '~backend/client';
import type { ProfileData } from '~backend/profile/get_profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await backend.profile.getProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden bg-blue-600">
                    <img
                      src={profile.photoUrl || "/api/placeholder/192/192"}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
                  <p className="text-teal-400 mb-4">{profile.title}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-4 h-4 text-teal-400" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-4 h-4 text-teal-400" />
                    <span>{profile.phone}</span>
                  </div>
                </div>

                {/* Skills Section */}
                {generalSkills.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="w-5 h-5 text-teal-400" />
                      <h2 className="text-xl font-semibold text-white">Skills</h2>
                    </div>
                    <div className="space-y-4">
                      {generalSkills.map((skill) => (
                        <div key={skill.id}>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-300">{skill.name}</span>
                            <span className="text-teal-400">{skill.percentage}%</span>
                          </div>
                          <Progress value={skill.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Management Skills */}
                {managementSkills.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="w-5 h-5 text-teal-400" />
                      <h2 className="text-xl font-semibold text-white">Manajemen SDM</h2>
                    </div>
                    <div className="space-y-4">
                      {managementSkills.map((skill) => (
                        <div key={skill.id}>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-300">{skill.name}</span>
                            <span className="text-teal-400">{skill.percentage}%</span>
                          </div>
                          <Progress value={skill.percentage} className="h-2" />
                        </div>
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
                  <Wrench className="w-5 h-5 text-teal-400" />
                  My Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {tools.map((tool) => (
                    <Badge key={tool.id} variant="secondary" className="bg-teal-600/20 text-teal-300 border-teal-600/30">
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
                  <GraduationCap className="w-5 h-5 text-teal-400" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-teal-400 pl-4">
                      <h3 className="font-semibold text-white">{edu.institution}, {edu.location}</h3>
                      <p className="text-teal-400 text-sm">{edu.startYear} - {edu.endYear}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="w-5 h-5 text-teal-400" />
                  Certificate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-2">{cert.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-300">{cert.issuer}</span>
                      </div>
                      {cert.description && (
                        <p className="text-gray-400 text-sm mb-2">{cert.description}</p>
                      )}
                      <div className="bg-teal-600 text-white text-center py-2 rounded text-sm">
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

      {/* Admin Link */}
      <div className="fixed bottom-4 right-4">
        <a
          href="/admin"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Admin Login
        </a>
      </div>
    </div>
  );
}
