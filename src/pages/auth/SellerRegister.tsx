import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { User, Mail, Lock, Eye, EyeOff, Building, MapPin, Tag, Image as ImageIcon, ArrowRight, ArrowLeft, CheckCircle2, Upload, Briefcase, Plus, Trash2, Info, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PasswordStrength from '../../components/auth/PasswordStrength';

interface Brand {
  name: string;
  description: string;
}

interface Company {
  name: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  brands: Brand[];
}

const SellerRegister = () => {
  const { countries, selectedCountry } = useCurrency();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companies: [
      {
        name: '',
        registrationNumber: '',
        taxId: '',
        address: '',
        countryCode: '',
        phone: '',
        email: '',
        brands: [{ name: '', description: '' }]
      }
    ] as Company[],
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { registerSeller } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 3;

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else if (step === 2) {
      const firstCompany = formData.companies[0];
      if (!firstCompany.name || !firstCompany.address) {
        setError('Please provide at least one company with a name and address');
        return;
      }
      const firstBrand = firstCompany.brands[0];
      if (!firstBrand.name) {
        setError('Please provide at least one brand name for your company');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.terms) {
      setError('Please accept the Seller Agreement');
      return;
    }

    setIsLoading(true);
    try {
      await registerSeller(formData);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register as seller');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCompanyChange = (index: number, field: keyof Company, value: string) => {
    const updatedCompanies = [...formData.companies];
    updatedCompanies[index] = { ...updatedCompanies[index], [field]: value };
    setFormData(prev => ({ ...prev, companies: updatedCompanies }));
  };

  const addCompany = () => {
    setFormData(prev => ({
      ...prev,
      companies: [
        ...prev.companies,
        {
          name: '',
          registrationNumber: '',
          taxId: '',
          address: '',
          phone: '',
          email: '',
          countryCode: selectedCountry?.code || 'PK',
          brands: [{ name: '', description: '' }]
        }
      ]
    }));
  };

  const removeCompany = (index: number) => {
    if (formData.companies.length === 1) return;
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.filter((_, i) => i !== index)
    }));
  };

  const handleBrandChange = (companyIndex: number, brandIndex: number, field: keyof Brand, value: string) => {
    const updatedCompanies = [...formData.companies];
    const updatedBrands = [...updatedCompanies[companyIndex].brands];
    updatedBrands[brandIndex] = { ...updatedBrands[brandIndex], [field]: value };
    updatedCompanies[companyIndex] = { ...updatedCompanies[companyIndex], brands: updatedBrands };
    setFormData(prev => ({ ...prev, companies: updatedCompanies }));
  };

  const addBrand = (companyIndex: number) => {
    const updatedCompanies = [...formData.companies];
    updatedCompanies[companyIndex].brands.push({ name: '', description: '' });
    setFormData(prev => ({ ...prev, companies: updatedCompanies }));
  };

  const removeBrand = (companyIndex: number, brandIndex: number) => {
    const updatedCompanies = [...formData.companies];
    if (updatedCompanies[companyIndex].brands.length === 1) return;
    updatedCompanies[companyIndex].brands = updatedCompanies[companyIndex].brands.filter((_, i) => i !== brandIndex);
    setFormData(prev => ({ ...prev, companies: updatedCompanies }));
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Application Received" subtitle="Your journey as a TAYFA partner begins here.">
        <div className="text-center py-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={40} className="text-brand-gold" />
          </motion.div>
          <h3 className="text-xl font-serif text-brand-dark mb-4">Your account is under review</h3>
          <p className="text-sm text-brand-dark/60 max-w-xs mx-auto mb-8 leading-relaxed">
            Our curation team is reviewing your application. You'll receive an email once your boutique is ready to go live.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors"
          >
            <span>Return to Marketplace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Partner with TAYFA" 
      subtitle={
        step === 1 ? "Start your professional boutique journey." :
        step === 2 ? "Tell us about your business & brands." :
        "Finalize your application."
      }
    >
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                step >= s ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20' : 'bg-brand-cream text-brand-dark/30'
              }`}>
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              <span className={`mt-2 text-[9px] font-bold uppercase tracking-tighter transition-colors ${
                step >= s ? 'text-brand-dark' : 'text-brand-dark/20'
              }`}>
                {s === 1 ? 'Account' : s === 2 ? 'Business' : 'Verify'}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-brand-cream rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            className="h-full bg-brand-gold"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-[11px] font-medium flex items-center space-x-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                    placeholder="biz@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-12 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-dark/20 hover:text-brand-gold transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.password && <PasswordStrength password={formData.password} />}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-dark/60 mb-2 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-brand-dark/20 group-focus-within:text-brand-gold transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-dark/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/20 text-sm transition-all placeholder:text-brand-dark/20"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {formData.companies.map((company, cIndex) => (
                <div key={cIndex} className="p-6 bg-brand-cream/10 rounded-3xl border border-brand-dark/5 space-y-6 relative">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-dark flex items-center">
                      <Building size={14} className="mr-2 text-brand-gold" />
                      Company {formData.companies.length > 1 ? cIndex + 1 : ''}
                    </h3>
                    {formData.companies.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeCompany(cIndex)}
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2 ml-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        required
                        value={company.name}
                        onChange={(e) => handleCompanyChange(cIndex, 'name', e.target.value)}
                        className="block w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all"
                        placeholder="Luxe Group"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2 ml-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={company.registrationNumber}
                        onChange={(e) => handleCompanyChange(cIndex, 'registrationNumber', e.target.value)}
                        className="block w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all"
                        placeholder="REG-12345"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2 ml-1">
                        Country
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Globe size={16} className="text-brand-dark/20" />
                        </div>
                        <select
                          required
                          value={company.countryCode}
                          onChange={(e) => handleCompanyChange(cIndex, 'countryCode', e.target.value)}
                          className="block w-full pl-12 pr-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all appearance-none"
                        >
                          <option value="">Select Country</option>
                          {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <ChevronDown size={14} className="text-brand-dark/20" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2 ml-1">
                        Business Address
                      </label>
                      <textarea
                        required
                        rows={1}
                        value={company.address}
                        onChange={(e) => handleCompanyChange(cIndex, 'address', e.target.value)}
                        className="block w-full px-4 py-3 bg-white border border-brand-dark/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/10 transition-all resize-none"
                        placeholder="123 Fashion Ave, Karachi"
                      />
                    </div>
                  </div>

                  {/* Brands Section */}
                  <div className="space-y-4 pt-4 border-t border-brand-dark/5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Brands under this company</h4>
                      <button 
                        type="button" 
                        onClick={() => addBrand(cIndex)}
                        className="text-[9px] font-bold uppercase tracking-widest text-brand-gold flex items-center hover:text-brand-dark transition-colors"
                      >
                        <Plus size={12} className="mr-1" /> Add Brand
                      </button>
                    </div>

                    {company.brands.map((brand, bIndex) => (
                      <div key={bIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-white/50 p-4 rounded-2xl border border-brand-dark/5">
                        <div>
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-dark/30 mb-1">Brand Name</label>
                          <input
                            type="text"
                            required
                            value={brand.name}
                            onChange={(e) => handleBrandChange(cIndex, bIndex, 'name', e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-brand-dark/5 rounded-lg text-xs focus:ring-1 focus:ring-brand-gold/20 transition-all"
                            placeholder="Aura Luxe"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-brand-dark/30 mb-1">Description</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={brand.description}
                              onChange={(e) => handleBrandChange(cIndex, bIndex, 'description', e.target.value)}
                              className="block w-full px-3 py-2 bg-white border border-brand-dark/5 rounded-lg text-xs focus:ring-1 focus:ring-brand-gold/20 transition-all"
                              placeholder="Premium leather goods..."
                            />
                            {company.brands.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeBrand(cIndex, bIndex)}
                                className="text-rose-400 hover:text-rose-500 transition-colors pt-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCompany}
                className="w-full py-4 border-2 border-dashed border-brand-dark/10 rounded-3xl text-[11px] font-bold uppercase tracking-widest text-brand-dark/40 hover:border-brand-gold/30 hover:text-brand-gold transition-all flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Another Company</span>
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-8 border-2 border-dashed border-brand-dark/10 rounded-3xl bg-brand-cream/5 text-center group hover:border-brand-gold/30 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-brand-dark/20 group-hover:text-brand-gold transition-colors" />
                </div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-dark mb-1">Upload Business Documents</h4>
                <p className="text-[10px] text-brand-dark/40 uppercase tracking-tighter">PDF, JPG or PNG (Max 5MB)</p>
                <p className="mt-4 text-[9px] text-brand-dark/30 leading-relaxed max-w-[200px] mx-auto uppercase tracking-widest">
                  Please upload your NTN certificate and business registration documents.
                </p>
              </div>

              <div className="bg-brand-gold/5 border border-brand-gold/10 p-4 rounded-2xl flex items-start space-x-3">
                <Info size={16} className="text-brand-gold shrink-0 mt-0.5" />
                <p className="text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-widest font-medium">
                  Your application will be reviewed by our admin team. This process typically takes 2-3 business days.
                </p>
              </div>

              <div className="flex items-start p-4 bg-brand-cream/10 rounded-2xl border border-brand-dark/5">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-brand-dark/10 rounded"
                  />
                </div>
                <div className="ml-3 text-[10px] text-brand-dark/60 leading-relaxed uppercase tracking-widest font-medium">
                  I agree to the{' '}
                  <Link to="/seller-terms" className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">
                    Seller Agreement
                  </Link>
                  {' '}and verify that all provided information is accurate.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex space-x-4 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 flex items-center justify-center space-x-2 py-4 px-4 border border-brand-dark/5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-brand-dark hover:bg-brand-cream/30 transition-all"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}
          
          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-[2] flex items-center justify-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-brand-dark/5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold transition-all group"
            >
              <span>Continue</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] flex items-center justify-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-brand-dark/5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-brand-dark hover:bg-brand-gold transition-all disabled:opacity-50"
            >
              <Briefcase size={16} />
              <span>{isLoading ? 'Submitting...' : 'Apply Now'}</span>
            </button>
          )}
        </div>
      </form>

      <div className="mt-12 text-center">
        <p className="text-[11px] text-brand-dark/40 uppercase tracking-widest font-medium">
          Already have a partner account?{' '}
          <Link to="/signin" className="font-bold text-brand-gold hover:text-brand-gold/80 transition-colors underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SellerRegister;
