import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, Save, MapPin, Building2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const AccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (updateProfile) {
        await updateProfile({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        });
      }
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-serif mb-4">Account Settings</h1>
        <p className="text-brand-dark/60">
          Manage your profile, security, and shipping addresses.
        </p>
      </div>

      <div className="space-y-12">
        {/* Profile Section */}
        <section className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-gold">
              <User size={20} />
            </div>
            <h2 className="text-2xl font-serif">Profile Information</h2>
          </div>

          <Card className="p-8">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={18} />
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-12 py-4 focus:outline-none focus:border-brand-gold transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={18} />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-12 py-4 focus:outline-none focus:border-brand-gold transition-colors"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/20" size={18} />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-12 py-4 focus:outline-none focus:border-brand-gold transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="premium" disabled={isSaving} className="flex items-center space-x-2">
                  <Save size={16} />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* Password Section */}
        <section className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-gold">
              <Lock size={20} />
            </div>
            <h2 className="text-2xl font-serif">Security</h2>
          </div>

          <Card className="p-8">
            <form className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">New Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="button" variant="outline" className="flex items-center space-x-2">
                  <Lock size={16} />
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* Addresses Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-gold">
                <MapPin size={20} />
              </div>
              <h2 className="text-2xl font-serif">Shipping Addresses</h2>
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Plus size={14} />
              <span>Add New</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-brand-gold/20 bg-brand-gold/5 relative">
              <div className="absolute top-6 right-6 flex space-x-2">
                <button className="text-brand-dark/40 hover:text-brand-gold transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-brand-gold text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Default</span>
                  <p className="font-bold">Home</p>
                </div>
                <div className="text-sm text-brand-dark/60 space-y-1">
                  <p>{user?.fullName}</p>
                  <p>123 Luxury Lane</p>
                  <p>New York, NY 10001</p>
                  <p>United States</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountSettings;
