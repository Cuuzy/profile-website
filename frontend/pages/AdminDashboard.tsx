import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Code, GraduationCap, Award, Wrench, Camera } from 'lucide-react';
import backend from '~backend/client';
import type { ProfileData } from '~backend/profile/get_profile';

export default function AdminDashboard() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB for HD quality)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "Image size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Check for supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedFormats.includes(file.type.toLowerCase())) {
      toast({
        title: "Error",
        description: "Please use JPG, PNG, GIF, or WebP format for best quality",
        variant: "destructive",
      });
      return;
    }

    setPhotoUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const response = await backend.profile.uploadPhoto({
            photoData: base64Data,
            fileName: file.name,
          });

          if (response.success) {
            toast({
              title: "Success",
              description: "HD profile photo updated successfully",
            });

            // Refresh profile data
            const data = await backend.profile.getProfile();
            setProfileData(data);
          }
        } catch (error) {
          console.error('Failed to upload photo:', error);
          toast({
            title: "Error",
            description: "Failed to upload photo. Please try again.",
            variant: "destructive",
          });
        } finally {
          setPhotoUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to process file:', error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
      setPhotoUploading(false);
    }
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

  const handleCreateEducation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createEducation({
        institution: fd.get('institution') as string,
        location: fd.get('eduLocation') as string,
        startYear: parseInt(fd.get('startYear') as string),
        endYear: parseInt(fd.get('endYear') as string),
      });
      toast({ title: "Success", description: "Education added" });
      const data = await backend.profile.getProfile();
      setProfileData(data);
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add education:', err);
      toast({ title: "Error", description: "Failed to add education", variant: "destructive" });
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await backend.profile.deleteEducation({ id });
      toast({ title: "Success", description: "Education deleted" });
      const data = await backend.profile.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to delete education:', err);
      toast({ title: "Error", description: "Failed to delete education", variant: "destructive" });
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createCertificate({
        title: fd.get('certTitle') as string,
        issuer: fd.get('certIssuer') as string,
        description: (fd.get('certDescription') as string) || undefined,
        issueDate: fd.get('certIssueDate') as string,
        imageUrl: (fd.get('certImageUrl') as string) || undefined,
      });
      toast({ title: "Success", description: "Certificate added" });
      const data = await backend.profile.getProfile();
      setProfileData(data);
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add certificate:', err);
      toast({ title: "Error", description: "Failed to add certificate", variant: "destructive" });
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    try {
      await backend.profile.deleteCertificate({ id });
      toast({ title: "Success", description: "Certificate deleted" });
      const data = await backend.profile.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      toast({ title: "Error", description: "Failed to delete certificate", variant: "destructive" });
    }
  };

  const handleCreateTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createTool({
        name: fd.get('toolName') as string,
        iconUrl: (fd.get('toolIconUrl') as string) || undefined,
      });
      toast({ title: "Success", description: "Tool added" });
      const data = await backend.profile.getProfile();
      setProfileData(data);
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add tool:', err);
      toast({ title: "Error", description: "Failed to add tool", variant: "destructive" });
    }
  };

  const handleDeleteTool = async (id: number) => {
    try {
      await backend.profile.deleteTool({ id });
      toast({ title: "Success", description: "Tool deleted" });
      const data = await backend.profile.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to delete tool:', err);
      toast({ title: "Error", description: "Failed to delete tool", variant: "destructive" });
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
          <TabsList className="bg-gray-800 border-gray-700 flex flex-wrap">
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
            <TabsTrigger value="tools" className="data-[state=active]:bg-teal-600">
              <Wrench className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Photo Upload Section */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Profile Photo (HD Quality)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-600 border-2 border-teal-600/30">
                      <img
                        src={profileData.profile.photoUrl || "/api/placeholder/128/128"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="photo-upload" className="text-gray-300 block mb-2">
                        Upload HD Photo
                      </Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handlePhotoUpload}
                        disabled={photoUploading}
                        className="bg-gray-700 border-gray-600 text-white file:bg-teal-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
                      />
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-400 text-sm">
                          {photoUploading ? "Uploading HD photo..." : "Max size: 10MB for HD quality"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Supported formats: JPG, PNG, GIF, WebP
                        </p>
                        <p className="text-teal-400 text-xs">
                          💡 Tip: Use high resolution images (1080p or higher) for best quality
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Info Section */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Edit Profile Information</CardTitle>
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
            </div>
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
                      <select
                        id="skillCategory"
                        name="skillCategory"
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                        required
                      >
                        <option value="general">General Skills</option>
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                        <option value="technical">Technical</option>
                        <option value="marketing">Marketing</option>
                        <option value="productivity">Productivity</option>
                        <option value="management">Manajemen SDM</option>
                      </select>
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
                          <p className="text-gray-400">{skill.percentage}% - {skill.category === 'management' ? 'Manajemen SDM' : skill.category}</p>
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
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Add Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateEducation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="institution" className="text-gray-300">Institution</Label>
                      <Input id="institution" name="institution" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div>
                      <Label htmlFor="eduLocation" className="text-gray-300">Location</Label>
                      <Input id="eduLocation" name="eduLocation" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div>
                      <Label htmlFor="startYear" className="text-gray-300">Start Year</Label>
                      <Input id="startYear" name="startYear" type="number" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div>
                      <Label htmlFor="endYear" className="text-gray-300">End Year</Label>
                      <Input id="endYear" name="endYear" type="number" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Education</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Education History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.education.map((edu) => (
                      <div key={edu.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{edu.institution}</h3>
                          <p className="text-gray-400">{edu.location} • {edu.startYear} - {edu.endYear}</p>
                        </div>
                        <Button onClick={() => handleDeleteEducation(edu.id)} variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Add Certificate</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCertificate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="certTitle" className="text-gray-300">Title</Label>
                      <Input id="certTitle" name="certTitle" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div>
                      <Label htmlFor="certIssuer" className="text-gray-300">Issuer</Label>
                      <Input id="certIssuer" name="certIssuer" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div>
                      <Label htmlFor="certIssueDate" className="text-gray-300">Issue Date</Label>
                      <Input id="certIssueDate" name="certIssueDate" placeholder="e.g. Oktober 2019" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="certImageUrl" className="text-gray-300">Image URL (optional)</Label>
                      <Input id="certImageUrl" name="certImageUrl" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="certDescription" className="text-gray-300">Description (optional)</Label>
                      <Textarea id="certDescription" name="certDescription" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Certificate</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.certificates.map((cert) => (
                      <div key={cert.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{cert.title}</h3>
                          <p className="text-teal-400">{cert.issuer}</p>
                          {cert.description && <p className="text-gray-400 mt-1">{cert.description}</p>}
                          <p className="text-gray-500 text-sm mt-1">Issued: {cert.issueDate}</p>
                        </div>
                        <Button onClick={() => handleDeleteCertificate(cert.id)} variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Add Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTool} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="toolName" className="text-gray-300">Tool Name</Label>
                      <Input id="toolName" name="toolName" className="bg-gray-700 border-gray-600 text-white" required />
                    </div>
                    <div>
                      <Label htmlFor="toolIconUrl" className="text-gray-300">Icon URL (optional)</Label>
                      <Input id="toolIconUrl" name="toolIconUrl" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Tool</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.tools.map((tool) => (
                      <div key={tool.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{tool.name}</h3>
                          {tool.iconUrl && <p className="text-gray-400 text-sm">{tool.iconUrl}</p>}
                        </div>
                        <Button onClick={() => handleDeleteTool(tool.id)} variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
