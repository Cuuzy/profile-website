import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Code, GraduationCap, Award } from 'lucide-react';
import backend from '~backend/client';
import type { ProfileData } from '~backend/profile/get_profile';

export default function AdminDashboard() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin');
        return;
      }

      try {
        const response = await backend.profile.verifyToken({ token });
        if (!response.valid) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
          return;
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('adminToken');
        navigate('/admin');
        return;
      }

      // Fetch profile data
      try {
        const data = await backend.profile.getProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await backend.profile.updateProfile({
        name: formData.get('name') as string,
        title: formData.get('title') as string,
        location: formData.get('location') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Refresh data
      const data = await backend.profile.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleCreateSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await backend.profile.createSkill({
        name: formData.get('skillName') as string,
        percentage: parseInt(formData.get('skillPercentage') as string),
        category: formData.get('skillCategory') as string,
      });

      toast({
        title: "Success",
        description: "Skill added successfully",
      });

      // Refresh data
      const data = await backend.profile.getProfile();
      setProfileData(data);
      
      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to create skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await backend.profile.deleteSkill({ id });
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });

      // Refresh data
      const data = await backend.profile.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to delete skill:', error);
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    }
  };

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
        <div className="text-white text-xl">Failed to load data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => window.open('/', '_blank')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              View Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-teal-600">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-teal-600">
              <Code className="w-4 h-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-teal-600">
              <GraduationCap className="w-4 h-4 mr-2" />
              Education
            </TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-teal-600">
              <Award className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={profileData.profile.name}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title" className="text-gray-300">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={profileData.profile.title}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-300">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      defaultValue={profileData.profile.location}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={profileData.profile.email}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={profileData.profile.phone}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Add New Skill</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSkill} className="space-y-4">
                    <div>
                      <Label htmlFor="skillName" className="text-gray-300">Skill Name</Label>
                      <Input
                        id="skillName"
                        name="skillName"
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="skillPercentage" className="text-gray-300">Percentage (0-100)</Label>
                      <Input
                        id="skillPercentage"
                        name="skillPercentage"
                        type="number"
                        min="0"
                        max="100"
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="skillCategory" className="text-gray-300">Category</Label>
                      <Input
                        id="skillCategory"
                        name="skillCategory"
                        defaultValue="general"
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                      Add Skill
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Current Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-white">{skill.name}</h3>
                          <p className="text-gray-400">{skill.percentage}% - {skill.category}</p>
                        </div>
                        <Button
                          onClick={() => handleDeleteSkill(skill.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="education">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Education History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-gray-700/30 rounded-lg">
                      <h3 className="font-semibold text-white">{edu.institution}</h3>
                      <p className="text-gray-400">{edu.location} • {edu.startYear} - {edu.endYear}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.certificates.map((cert) => (
                    <div key={cert.id} className="p-4 bg-gray-700/30 rounded-lg">
                      <h3 className="font-semibold text-white">{cert.title}</h3>
                      <p className="text-teal-400">{cert.issuer}</p>
                      {cert.description && (
                        <p className="text-gray-400 mt-2">{cert.description}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">Issued: {cert.issueDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
