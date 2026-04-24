import React, { useState, useEffect } from 'react';
import { 
  Mail, Save, RefreshCcw, CheckCircle2, AlertCircle, Info, 
  Eye, EyeOff, Send, Edit2, Globe, Command, 
  Layout, Type, ExternalLink, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface EmailConfig {
  id?: number;
  mailDriver: string;
  mailHost: string;
  mailPort: number;
  mailUsername: string;
  mailPassword: string;
  mailEncryption: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables: string;
  isActive: boolean;
}

const EmailSettings = () => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // SMTP Config state
  const [config, setConfig] = useState<EmailConfig>({
    mailDriver: 'smtp',
    mailHost: '',
    mailPort: 587,
    mailUsername: '',
    mailPassword: '',
    mailEncryption: 'tls',
    fromEmail: '',
    fromName: '',
    isActive: true
  });

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Test email modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [configRes, templatesRes] = await Promise.all([
        axios.get('/api/admin/email-settings'),
        axios.get('/api/admin/email-templates')
      ]);
      if (configRes.data.id) setConfig(configRes.data);
      setTemplates(templatesRes.data);
    } catch (err) {
      console.error('Error fetching email data:', err);
      setError('Failed to load email settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await axios.post('/api/admin/email-settings', config);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient) return;
    setIsSendingTest(true);
    try {
      await axios.post('/api/admin/email-settings/test', { 
        toEmail: testRecipient,
        config: config // Send current form values
      });
      setIsTestModalOpen(false);
      setTestRecipient('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    setIsSaving(true);
    try {
      await axios.put(`/api/admin/email-templates/${editingTemplate.id}`, editingTemplate);
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      setEditingTemplate(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-3">Email Settings</h1>
          <p className="text-brand-dark/60 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-8 h-[2px] bg-brand-gold"></span>
            SMTP Configuration & Notification Templates
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsTestModalOpen(true)}
            className="px-8 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-brand-dark/10 hover:bg-brand-dark hover:text-white transition-all flex items-center gap-2 shadow-sm bg-white"
          >
            <Send size={14} />
            Send Test
          </button>
        </div>
      </div>

      {/* Persistence Alerts */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Changes saved successfully!</span>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-rose-500 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-500/20"
          >
            <AlertCircle size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] border border-brand-dark/5 shadow-2xl shadow-brand-dark/[0.02] overflow-hidden">
        {/* Tabs Navigation */}
        <div className="flex border-b border-brand-dark/5 px-10 pt-8 relative">
          {[
            { id: 'smtp', label: 'SMTP Configuration', icon: Globe },
            { id: 'templates', label: 'Email Templates', icon: Layout }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative z-10 ${
                activeTab === tab.id ? 'text-brand-gold' : 'text-brand-dark/60 hover:text-brand-dark'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-gold rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-10">
          {activeTab === 'smtp' ? (
            <form onSubmit={handleSaveConfig} className="max-w-4xl space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mail Driver */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">Mail Driver</label>
                  <select 
                    value={config.mailDriver}
                    onChange={(e) => setConfig({...config, mailDriver: e.target.value})}
                    className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none appearance-none"
                  >
                    <option value="smtp">SMTP</option>
                  </select>
                </div>

                {/* Encryption */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">Encryption</label>
                  <select 
                    value={config.mailEncryption}
                    onChange={(e) => setConfig({...config, mailEncryption: e.target.value})}
                    className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Host */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">SMTP Host</label>
                  <input 
                    type="text" 
                    placeholder="smtp.gmail.com"
                    value={config.mailHost}
                    onChange={(e) => setConfig({...config, mailHost: e.target.value})}
                    className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none"
                    required
                  />
                </div>

                {/* Port */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">SMTP Port</label>
                  <input 
                    type="number" 
                    placeholder="587"
                    value={config.mailPort}
                    onChange={(e) => setConfig({...config, mailPort: parseInt(e.target.value)})}
                    className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none"
                    required
                  />
                </div>

                {/* Username */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">Username</label>
                  <input 
                    type="text" 
                    placeholder="your@email.com"
                    value={config.mailUsername}
                    onChange={(e) => setConfig({...config, mailUsername: e.target.value})}
                    className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={config.mailPassword}
                      onChange={(e) => setConfig({...config, mailPassword: e.target.value})}
                      className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none pr-14"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-brand-dark/30 hover:text-brand-gold transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* From Name */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">From Name</label>
                  <input 
                    type="text" 
                    placeholder="TAYFA"
                    value={config.fromName}
                    onChange={(e) => setConfig({...config, fromName: e.target.value})}
                    className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none"
                    required
                  />
                </div>

                {/* From Email */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">From Email</label>
                  <input 
                    type="email" 
                    placeholder="noreply@tayfa.pk"
                    value={config.fromEmail}
                    onChange={(e) => setConfig({...config, fromEmail: e.target.value})}
                    className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-medium focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-brand-dark/5 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-gold text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-gold/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCcw size={16} className="animate-spin" />
                  ) : (
                    'Save Configuration'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {templates.map((template) => (
                <motion.div 
                  layout
                  key={template.id}
                  className="bg-brand-cream/10 border border-brand-dark/5 rounded-3xl p-8 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-dark/[0.02] transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-brand-dark/5 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest truncate max-w-[200px]">{template.name.replace(/_/g, ' ')}</h3>
                        <p className="text-[10px] text-brand-dark/60 font-medium uppercase tracking-wider">System Template</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setEditingTemplate(template)}
                      className="p-3 bg-white border border-brand-dark/5 rounded-xl hover:bg-brand-gold hover:text-white transition-all text-brand-dark/30 shadow-sm"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40">Default Subject</span>
                      <p className="text-[11px] font-bold text-brand-dark/90 line-clamp-1 italic">"{template.subject}"</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                       {template.variables.split(',').map(v => (
                         <span key={v} className="px-2 py-1 bg-brand-dark/5 rounded-lg text-[9px] font-mono text-brand-gold/60">{v}</span>
                       ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Edit Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTemplate(null)}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-brand-dark/5 flex justify-between items-center bg-brand-cream/10">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-brand-gold text-white flex items-center justify-center">
                      <Edit2 size={18} />
                   </div>
                   <div>
                     <h2 className="text-xl font-serif">Edit Template</h2>
                     <p className="text-[9px] font-black uppercase tracking-widest text-brand-dark/40">{editingTemplate.name.replace(/_/g, ' ')}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setEditingTemplate(null)}
                  className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all text-brand-dark/30"
                >
                  <RefreshCcw size={20} className="rotate-45" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
                  {/* Form Side */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">Email Subject</label>
                      <input 
                        type="text" 
                        value={editingTemplate.subject}
                        onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                        className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-bold focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-4 h-[400px] flex flex-col">
                      <div className="flex justify-between items-end">
                        <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">Email Content (HTML)</label>
                        <div className="flex gap-2">
                           {editingTemplate.variables.split(',').map(v => (
                             <button 
                                key={v}
                                onClick={() => setEditingTemplate({...editingTemplate, body: editingTemplate.body + v})}
                                className="px-2 py-1 bg-brand-dark/5 rounded text-[8px] font-mono hover:bg-brand-gold/10 hover:text-brand-gold"
                             >
                               {v}
                             </button>
                           ))}
                        </div>
                      </div>
                      <textarea 
                        value={editingTemplate.body}
                        onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                        className="w-full flex-grow bg-brand-cream/30 border border-brand-dark/5 rounded-3xl p-8 text-xs font-mono focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Preview Side */}
                  <div className="space-y-4 flex flex-col">
                    <label className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70 ml-1">Live Preview</label>
                    <div className="flex-grow bg-white border border-brand-dark/10 rounded-[2rem] p-8 shadow-inner overflow-y-auto overflow-x-hidden min-h-[400px]">
                        <div 
                          className="prose prose-sm max-w-none prose-headings:font-serif"
                          dangerouslySetInnerHTML={{ __html: editingTemplate.body }}
                        />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-brand-cream/20 border-t border-brand-dark/5 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingTemplate(null)}
                  className="px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:bg-brand-dark/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateTemplate}
                  disabled={isSaving}
                  className="bg-brand-gold text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-gold/20 hover:brightness-110 transition-all flex items-center gap-3"
                >
                  {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Email Modal */}
      <AnimatePresence>
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTestModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={24} />
                </div>
                <h2 className="text-2xl font-serif">Send Test Email</h2>
                <p className="text-xs text-brand-dark/40 uppercase tracking-widest font-bold">Verify your configuration</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 ml-1">Recipient Email</label>
                <input 
                  type="email" 
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full h-14 bg-brand-cream/30 border border-brand-dark/5 rounded-2xl px-6 text-xs font-bold transition-all outline-none focus:ring-4 focus:ring-brand-gold/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:bg-brand-dark/5"
                >
                  Close
                </button>
                <button 
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || !testRecipient}
                  className="bg-brand-dark text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-brand-dark/10 hover:bg-brand-gold transition-all flex items-center justify-center gap-2"
                >
                  {isSendingTest ? <RefreshCcw size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Test
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailSettings;
