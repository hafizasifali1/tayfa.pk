import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, Settings, Plus, Edit2, 
  Trash2, CheckCircle2, XCircle, RefreshCw,
  Smartphone, Send, History, Layout,
  ExternalLink, Shield, Save, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import ProviderModal from '../../components/admin/ProviderModal';
import TemplateModal from '../../components/admin/TemplateModal';
import axios from 'axios';

interface Provider {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp';
  config: any;
  senderId: string;
  endpointUrl: string;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
}

interface Template {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp';
  content: string;
  language: string;
  isActive: boolean;
}

interface Log {
  id: string;
  recipient: string;
  message: string;
  status: string;
  error?: string;
  createdAt: string;
}

const CommunicationSettings = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'templates' | 'logs'>('providers');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('This is a test message from Tayfa.');
  const [testType, setTestType] = useState<'sms' | 'whatsapp'>('sms');
  const [sendingTest, setSendingTest] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'providers') {
        const res = await axios.get('/api/communication/providers');
        setProviders(res.data);
      } else if (activeTab === 'templates') {
        const res = await axios.get('/api/communication/templates');
        setTemplates(res.data);
      } else if (activeTab === 'logs') {
        const res = await axios.get('/api/communication/logs');
        setLogs(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testRecipient) return;
    setSendingTest(true);
    try {
      const res = await axios.post('/api/communication/send-test', {
        type: testType,
        recipient: testRecipient,
        message: testMessage
      });
      if (res.data.success) {
        // alert('Test message sent successfully!');
      } else {
        // alert('Failed to send test message: ' + res.data.error);
      }
    } catch (error: any) {
      // alert('Error sending test message: ' + error.message);
    } finally {
      setSendingTest(false);
    }
  };

  const handleDeleteProvider = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`/api/communication/providers/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the template "${name}"?`)) return;
    try {
      await axios.delete(`/api/communication/templates/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif mb-4">Communication</h1>
          <p className="text-brand-dark/60 font-sans">Configure SMS and WhatsApp providers, manage templates, and monitor logs.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
          {activeTab === 'providers' && (
            <Button variant="primary" icon={Plus} onClick={() => { setSelectedProvider(undefined); setIsProviderModalOpen(true); }}>
              Add Provider
            </Button>
          )}
          {activeTab === 'templates' && (
            <Button variant="primary" icon={Plus} onClick={() => { setSelectedTemplate(undefined); setIsTemplateModalOpen(true); }}>
              New Template
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-dark/5">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-8 py-4 text-sm font-bold transition-all relative ${
            activeTab === 'providers' ? 'text-brand-dark' : 'text-brand-dark/40 hover:text-brand-dark/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} />
            Providers
          </div>
          {activeTab === 'providers' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-8 py-4 text-sm font-bold transition-all relative ${
            activeTab === 'templates' ? 'text-brand-dark' : 'text-brand-dark/40 hover:text-brand-dark/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layout size={16} />
            Templates
          </div>
          {activeTab === 'templates' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-8 py-4 text-sm font-bold transition-all relative ${
            activeTab === 'logs' ? 'text-brand-dark' : 'text-brand-dark/40 hover:text-brand-dark/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <History size={16} />
            Logs
          </div>
          {activeTab === 'logs' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />
          )}
        </button>
      </div>

      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : providers.length === 0 ? (
              <Card className="p-20 text-center border-dashed border-2 border-brand-dark/10">
                <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="text-brand-dark/20" size={40} />
                </div>
                <h3 className="text-2xl font-serif mb-2">No Providers Configured</h3>
                <p className="text-brand-dark/40 mb-8 max-w-md mx-auto">
                  Add your first SMS or WhatsApp provider to start sending automated notifications.
                </p>
                <Button variant="primary" icon={Plus} onClick={() => { setSelectedProvider(undefined); setIsProviderModalOpen(true); }}>Add Provider</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((provider) => (
                  <Card key={provider.id} className="p-6 hover:shadow-xl transition-all border-brand-dark/5 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl ${provider.type === 'whatsapp' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
                        <MessageSquare size={24} />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedProvider(provider); setIsProviderModalOpen(true); }}
                          className="p-2 hover:bg-brand-cream rounded-lg text-brand-dark/40 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProvider(provider.id, provider.name)}
                          className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{provider.name}</h3>
                        {provider.isDefault && (
                          <Badge variant="info" className="text-[10px] uppercase tracking-tighter">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-brand-dark/40 uppercase tracking-widest">{provider.type}</p>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-dark/40">Sender ID</span>
                        <span className="font-mono">{provider.senderId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-dark/40">Priority</span>
                        <span>{provider.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-brand-dark/5">
                      <div className="flex items-center gap-2">
                        {provider.isActive ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-rose-500" />
                        )}
                        <span className={`text-xs font-bold ${provider.isActive ? 'text-green-600' : 'text-rose-600'}`}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="text-[10px]">Configure</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 border-brand-dark/5 bg-brand-dark text-white">
              <h3 className="text-xl font-serif mb-6">Send Test Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Channel</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTestType('sms')}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                        testType === 'sms' ? 'bg-brand-gold text-brand-dark' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      SMS
                    </button>
                    <button
                      onClick={() => setTestType('whatsapp')}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                        testType === 'whatsapp' ? 'bg-brand-gold text-brand-dark' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Recipient Number</label>
                  <input
                    type="text"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="+923001234567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Message</label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold/20 outline-none resize-none"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full py-4"
                  icon={Send}
                  onClick={handleSendTest}
                  loading={sendingTest}
                >
                  Send Test
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-brand-dark/5">
              <div className="flex gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Encryption Active</h4>
                  <p className="text-xs text-brand-dark/40">All API keys and tokens are encrypted at rest.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-brand-cream/50 border border-brand-dark/5">
                  <h5 className="text-xs font-bold mb-1">Failover System</h5>
                  <p className="text-[10px] text-brand-dark/60 leading-relaxed">
                    If the primary provider fails, the system will automatically try the next active provider based on priority.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="p-6 border-brand-dark/5 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <Badge variant={template.type === 'whatsapp' ? 'success' : 'neutral'} className="text-[10px] uppercase tracking-tighter">
                      {template.type}
                    </Badge>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedTemplate(template); setIsTemplateModalOpen(true); }}
                        className="p-2 hover:bg-brand-cream rounded-lg text-brand-dark/40 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                        className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{template.name.replace(/_/g, ' ')}</h3>
                  <div className="p-4 rounded-xl bg-brand-cream/30 border border-brand-dark/5 mb-6">
                    <p className="text-sm text-brand-dark/60 italic leading-relaxed">
                      "{template.content}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-brand-dark/40 uppercase tracking-widest">
                    <span>Language: {template.language}</span>
                    <span className="flex items-center gap-1">
                      <RefreshCw size={10} />
                      {template.content.match(/{.*?}/g)?.length || 0} Variables
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <Card className="overflow-hidden border-brand-dark/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-brand-dark/5">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Recipient</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Message</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-brand-dark/40 italic">
                      No communication logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-brand-cream/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-brand-dark">{log.recipient}</span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-xs text-brand-dark/60 line-clamp-1">{log.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.status === 'sent' ? (
                            <Badge variant="success" className="text-[10px]">Sent</Badge>
                          ) : log.status === 'failed' ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="neutral" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]">Failed</Badge>
                              <div className="group relative">
                                <AlertCircle size={14} className="text-rose-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-brand-dark text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  {log.error || 'Unknown error'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Badge variant="neutral" className="text-[10px]">{log.status}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-brand-dark/40">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        onSuccess={fetchData}
        provider={selectedProvider}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSuccess={fetchData}
        template={selectedTemplate}
      />
    </div>
  );
};

export default CommunicationSettings;
