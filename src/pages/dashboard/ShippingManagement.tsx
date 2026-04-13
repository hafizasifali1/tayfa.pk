import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Edit2, 
  Globe, 
  Home, 
  Save, 
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  ChevronDown,
  ChevronUp,
  Layers,
  Activity,
  Calculator,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { ShippingZone, ShippingOption, ShippingOverride, CarrierIntegration, CarrierRate } from '../../types';
import axios from 'axios';

const ShippingManagement: React.FC = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [integrations, setIntegrations] = useState<CarrierIntegration[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'zones' | 'integrations' | 'calculator'>('zones');

  // Rate Calculator State
  const [calcForm, setCalcForm] = useState({
    carrier: 'fedex',
    origin: '',
    destination: '',
    weight: 1,
    length: 10,
    width: 10,
    height: 10
  });
  const [calcResults, setCalcResults] = useState<CarrierRate[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Form state for new/editing zone
  const [zoneForm, setZoneForm] = useState<Partial<ShippingZone>>({
    name: '',
    type: 'domestic',
    regions: [],
    options: [],
    isActive: true
  });

  useEffect(() => {
    const fetchZones = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`/api/shipping/zones?sellerId=${user.id}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setZones(response.data);
        } else {
          // Default zones if none exist on server
          const defaultZones: ShippingZone[] = [
            {
              id: 'default-domestic',
              sellerId: user.id,
              name: 'Standard Domestic',
              type: 'domestic',
              regions: ['All Regions'],
              isActive: true,
              options: [
                { id: 'opt-1', name: 'Standard Shipping', cost: 5.99, estimatedDaysMin: 3, estimatedDaysMax: 5, isActive: true },
                { id: 'opt-2', name: 'Express Shipping', cost: 12.99, estimatedDaysMin: 1, estimatedDaysMax: 2, isActive: true }
              ]
            }
          ];
          setZones(defaultZones);
          await axios.post('/api/shipping/zones', { sellerId: user.id, zones: defaultZones });
        }
      } catch (error) {
        console.error('Failed to fetch zones', error);
        setZones([]);
      }
    };

    const fetchIntegrations = async () => {
      try {
        const response = await axios.get('/api/shipping/integrations');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setIntegrations(response.data);
        } else {
          const defaultIntegrations: CarrierIntegration[] = [
            { id: 'int-fedex', carrier: 'fedex', name: 'FedEx Integration', isActive: false, config: { testMode: true } },
            { id: 'int-dhl', carrier: 'dhl', name: 'DHL Integration', isActive: false, config: { testMode: true } },
            { id: 'int-ups', carrier: 'ups', name: 'UPS Integration', isActive: false, config: { testMode: true } },
            { id: 'int-usps', carrier: 'usps', name: 'USPS Integration', isActive: false, config: { testMode: true } }
          ];
          setIntegrations(defaultIntegrations);
        }
      } catch (error) {
        console.error('Failed to fetch integrations', error);
        setIntegrations([]);
      }
    };
    fetchZones();
    fetchIntegrations();
  }, [user?.id]);

  const saveZones = async (newZones: ShippingZone[]) => {
    if (!Array.isArray(newZones)) return;
    setZones(newZones);
    if (user?.id) {
      try {
        await axios.post('/api/shipping/zones', { sellerId: user.id, zones: newZones });
      } catch (error) {
        console.error('Failed to save zones', error);
      }
    }
  };

  const saveIntegrations = async (newIntegrations: CarrierIntegration[]) => {
    if (!Array.isArray(newIntegrations)) return;
    setIntegrations(newIntegrations);
    try {
      await axios.post('/api/shipping/integrations', newIntegrations);
    } catch (error) {
      showNotification('error', 'Failed to save integrations to server');
    }
  };

  const handleToggleIntegration = (id: string) => {
    if (!Array.isArray(integrations)) return;
    const updated = integrations.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i);
    saveIntegrations(updated);
    showNotification('success', `Integration ${updated.find(i => i.id === id)?.isActive ? 'enabled' : 'disabled'}`);
  };

  const handleCalculateRates = async () => {
    setIsCalculating(true);
    try {
      const response = await axios.post('/api/shipping/rates', calcForm);
      if (Array.isArray(response.data)) {
        setCalcResults(response.data);
      } else {
        setCalcResults([]);
      }
    } catch (error) {
      showNotification('error', 'Failed to fetch rates');
      setCalcResults([]);
    } finally {
      setIsCalculating(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateZone = (zone: Partial<ShippingZone>): boolean => {
    const errors: Record<string, string> = {};
    if (!zone.name?.trim()) errors.name = 'Zone name is required';
    if (!Array.isArray(zone.regions) || zone.regions.length === 0) errors.regions = 'At least one region is required';
    
    if (Array.isArray(zone.options)) {
      zone.options.forEach((option, idx) => {
        if (!option.name?.trim()) errors[`option_${option.id}_name`] = 'Method name is required';
        if (option.cost < 0) errors[`option_${option.id}_cost`] = 'Cost cannot be negative';
        if (option.estimatedDaysMin < 0) errors[`option_${option.id}_min`] = 'Min days cannot be negative';
        if (option.estimatedDaysMax < option.estimatedDaysMin) errors[`option_${option.id}_max`] = 'Max days must be greater than min days';
        
        if (Array.isArray(option.overrides)) {
          option.overrides.forEach((override) => {
            if (!override.region?.trim()) errors[`override_${override.id}_region`] = 'Region is required';
            if (override.cost < 0) errors[`override_${override.id}_cost`] = 'Cost cannot be negative';
          });
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddZone = () => {
    if (!validateZone(zoneForm)) {
      showNotification('error', 'Please fix the errors in the form');
      return;
    }

    const newZone: ShippingZone = {
      id: Math.random().toString(36).substr(2, 9),
      sellerId: user?.id || '',
      name: zoneForm.name || '',
      type: zoneForm.type as 'domestic' | 'international',
      regions: zoneForm.regions || [],
      options: zoneForm.options || [],
      isActive: true
    };

    const updatedZones = Array.isArray(zones) ? [...zones, newZone] : [newZone];
    saveZones(updatedZones);
    setIsAddingZone(false);
    setZoneForm({ name: '', type: 'domestic', regions: [], options: [], isActive: true });
    setValidationErrors({});
    showNotification('success', 'Shipping zone added successfully');
  };

  const handleUpdateZone = () => {
    if (!editingZone || !Array.isArray(zones)) return;
    if (!validateZone(editingZone)) {
      showNotification('error', 'Please fix the errors in the form');
      return;
    }

    const updatedZones = zones.map(z => z.id === editingZone.id ? editingZone : z);
    saveZones(updatedZones);
    setEditingZone(null);
    setValidationErrors({});
    showNotification('success', 'Shipping zone updated successfully');
  };

  const handleDeleteZone = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipping zone?')) {
      const updatedZones = Array.isArray(zones) ? zones.filter(z => z.id !== id) : [];
      saveZones(updatedZones);
      showNotification('success', 'Shipping zone deleted');
    }
  };

  const addOptionToForm = (isEditing: boolean) => {
    const newOption: ShippingOption = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Shipping Method',
      cost: 0,
      estimatedDaysMin: 1,
      estimatedDaysMax: 7,
      isActive: true
    };

    if (isEditing && editingZone) {
      setEditingZone({
        ...editingZone,
        options: Array.isArray(editingZone.options) ? [...editingZone.options, newOption] : [newOption]
      });
    } else {
      setZoneForm({
        ...zoneForm,
        options: Array.isArray(zoneForm.options) ? [...zoneForm.options, newOption] : [newOption]
      });
    }
  };

  const updateOptionInForm = (optionId: string, updates: Partial<ShippingOption>, isEditing: boolean) => {
    if (isEditing && editingZone) {
      setEditingZone({
        ...editingZone,
        options: Array.isArray(editingZone.options) ? editingZone.options.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt) : []
      });
    } else {
      setZoneForm({
        ...zoneForm,
        options: Array.isArray(zoneForm.options) ? zoneForm.options.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt) : []
      });
    }
  };

  const removeOptionFromForm = (optionId: string, isEditing: boolean) => {
    if (isEditing && editingZone) {
      setEditingZone({
        ...editingZone,
        options: Array.isArray(editingZone.options) ? editingZone.options.filter(opt => opt.id !== optionId) : []
      });
    } else {
      setZoneForm({
        ...zoneForm,
        options: Array.isArray(zoneForm.options) ? zoneForm.options.filter(opt => opt.id !== optionId) : []
      });
    }
  };

  const addOverrideToOption = (optionId: string, isEditing: boolean) => {
    const newOverride: ShippingOverride = {
      id: Math.random().toString(36).substr(2, 9),
      region: 'New Region',
      cost: 0,
      estimatedDaysMin: 1,
      estimatedDaysMax: 14
    };

    if (isEditing && editingZone) {
      setEditingZone({
        ...editingZone,
        options: Array.isArray(editingZone.options) ? editingZone.options.map(opt => 
          opt.id === optionId 
            ? { ...opt, overrides: Array.isArray(opt.overrides) ? [...opt.overrides, newOverride] : [newOverride] } 
            : opt
        ) : []
      });
    } else {
      setZoneForm({
        ...zoneForm,
        options: Array.isArray(zoneForm.options) ? zoneForm.options.map(opt => 
          opt.id === optionId 
            ? { ...opt, overrides: Array.isArray(opt.overrides) ? [...opt.overrides, newOverride] : [newOverride] } 
            : opt
        ) : []
      });
    }
  };

  const updateOverrideInOption = (optionId: string, overrideId: string, updates: Partial<ShippingOverride>, isEditing: boolean) => {
    if (isEditing && editingZone) {
      setEditingZone({
        ...editingZone,
        options: Array.isArray(editingZone.options) ? editingZone.options.map(opt => 
          opt.id === optionId 
            ? { 
                ...opt, 
                overrides: Array.isArray(opt.overrides) ? opt.overrides.map(ov => ov.id === overrideId ? { ...ov, ...updates } : ov) : []
              } 
            : opt
        ) : []
      });
    } else {
      setZoneForm({
        ...zoneForm,
        options: Array.isArray(zoneForm.options) ? zoneForm.options.map(opt => 
          opt.id === optionId 
            ? { 
                ...opt, 
                overrides: Array.isArray(opt.overrides) ? opt.overrides.map(ov => ov.id === overrideId ? { ...ov, ...updates } : ov) : []
              } 
            : opt
        ) : []
      });
    }
  };

  const removeOverrideFromOption = (optionId: string, overrideId: string, isEditing: boolean) => {
    if (isEditing && editingZone) {
      setEditingZone({
        ...editingZone,
        options: Array.isArray(editingZone.options) ? editingZone.options.map(opt => 
          opt.id === optionId 
            ? { ...opt, overrides: Array.isArray(opt.overrides) ? opt.overrides.filter(ov => ov.id !== overrideId) : [] } 
            : opt
        ) : []
      });
    } else {
      setZoneForm({
        ...zoneForm,
        options: Array.isArray(zoneForm.options) ? zoneForm.options.map(opt => 
          opt.id === optionId 
            ? { ...opt, overrides: Array.isArray(opt.overrides) ? opt.overrides.filter(ov => ov.id !== overrideId) : [] } 
            : opt
        ) : []
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-brand-dark">Shipping Management</h2>
          <p className="text-brand-dark/50 text-sm mt-1">Configure your shipping zones, rates, and delivery times.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'calculator' 
                ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20' 
                : 'bg-brand-cream text-brand-dark hover:bg-brand-cream/80'
            }`}
          >
            <Calculator size={16} />
            <span>Rate Calculator</span>
          </button>
          <button
            onClick={() => setIsAddingZone(true)}
            className="flex items-center justify-center space-x-2 bg-brand-dark text-white px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/10"
          >
            <Plus size={16} />
            <span>Add Shipping Zone</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-8 border-b border-brand-dark/5">
        <button
          onClick={() => setActiveTab('zones')}
          className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
            activeTab === 'zones' ? 'text-brand-dark' : 'text-brand-dark/40 hover:text-brand-dark'
          }`}
        >
          Shipping Zones
          {activeTab === 'zones' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />}
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
            activeTab === 'integrations' ? 'text-brand-dark' : 'text-brand-dark/40 hover:text-brand-dark'
          }`}
        >
          Carrier Integrations
          {activeTab === 'integrations' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold" />}
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center space-x-3 ${
              notification.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Zones List */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 gap-6">
          {zones.map((zone) => (
            <motion.div
              key={zone.id}
              layout
              className="bg-white rounded-3xl border border-brand-dark/5 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-dark/5">
                <div className="flex items-start space-x-4">
                  <div className={`p-4 rounded-2xl ${zone.type === 'domestic' ? 'bg-blue-50 text-blue-600' : 'bg-brand-gold/10 text-brand-gold'}`}>
                    {zone.type === 'domestic' ? <Home size={24} /> : <Globe size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-serif text-brand-dark">{zone.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        zone.type === 'domestic' ? 'bg-blue-100 text-blue-700' : 'bg-brand-gold/20 text-brand-gold'
                      }`}>
                        {zone.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-brand-dark/40 text-xs">
                      <MapPin size={14} />
                      <span>{zone.regions.join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setEditingZone(zone)}
                    className="p-3 text-brand-dark/40 hover:text-brand-gold hover:bg-brand-cream/50 rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="p-3 text-brand-dark/40 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-brand-cream/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zone.options.map((option) => (
                    <div key={option.id} className="bg-white p-5 rounded-2xl border border-brand-dark/5 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-brand-dark text-sm">{option.name}</h4>
                        <div className="p-2 bg-brand-cream/50 rounded-lg text-brand-gold">
                          <Truck size={14} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-brand-dark/40 uppercase tracking-widest font-bold">Cost</span>
                          <span className="text-brand-dark font-bold">${option.cost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-brand-dark/40 uppercase tracking-widest font-bold">Delivery</span>
                          <span className="text-brand-dark font-bold">{option.estimatedDaysMin}-{option.estimatedDaysMax} Days</span>
                        </div>
                        {option.overrides && option.overrides.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-brand-dark/5 space-y-2">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold">Regional Overrides</p>
                            {option.overrides.map(override => (
                              <div key={override.id} className="flex items-center justify-between text-[10px] bg-brand-cream/30 p-2 rounded-lg">
                                <span className="text-brand-dark font-medium">{override.region}</span>
                                <span className="text-brand-dark font-bold">${override.cost.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {zone.options.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-brand-dark/10 rounded-2xl">
                      <p className="text-brand-dark/30 text-sm italic">No shipping methods defined for this zone.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {zones.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-brand-dark/5">
              <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                <Truck size={40} />
              </div>
              <h3 className="text-2xl font-serif text-brand-dark">No Shipping Zones</h3>
              <p className="text-brand-dark/40 mt-2 max-w-md mx-auto">
                Start by adding a shipping zone to define where you ship and how much it costs.
              </p>
              <button
                onClick={() => setIsAddingZone(true)}
                className="mt-8 bg-brand-dark text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
              >
                Add Your First Zone
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carrier Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white p-8 rounded-[2rem] border border-brand-dark/5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${
                    integration.carrier === 'fedex' ? 'bg-orange-50 text-orange-600' :
                    integration.carrier === 'dhl' ? 'bg-yellow-50 text-yellow-600' :
                    integration.carrier === 'ups' ? 'bg-amber-900 text-amber-100' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    <Truck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-brand-dark capitalize">{integration.carrier}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Real-time carrier rates</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleIntegration(integration.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    integration.isActive ? 'bg-brand-gold' : 'bg-brand-dark/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      integration.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">API Key</label>
                    <input
                      type="password"
                      value={integration.config.apiKey || ''}
                      onChange={(e) => {
                        const updated = integrations.map(i => i.id === integration.id ? { ...i, config: { ...i.config, apiKey: e.target.value } } : i);
                        setIntegrations(updated);
                      }}
                      placeholder="••••••••••••••••"
                      className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  {integration.carrier !== 'usps' && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">API Secret</label>
                      <input
                        type="password"
                        value={integration.config.apiSecret || ''}
                        onChange={(e) => {
                          const updated = integrations.map(i => i.id === integration.id ? { ...i, config: { ...i.config, apiSecret: e.target.value } } : i);
                          setIntegrations(updated);
                        }}
                        placeholder="••••••••••••••••"
                        className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-brand-dark/5">
                  <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Encrypted Connection</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Test Mode</span>
                      <button
                        onClick={() => {
                          const updated = integrations.map(i => i.id === integration.id ? { ...i, config: { ...i.config, testMode: !i.config.testMode } } : i);
                          saveIntegrations(updated);
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors ${integration.config.testMode ? 'bg-brand-gold/20' : 'bg-brand-dark/5'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${integration.config.testMode ? 'right-1 bg-brand-gold' : 'left-1 bg-brand-dark/20'}`} />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        saveIntegrations(integrations);
                        showNotification('success', `${integration.carrier.toUpperCase()} settings saved`);
                      }}
                      className="bg-brand-dark text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rate Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-brand-dark/5 shadow-sm h-fit">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-brand-cream text-brand-gold rounded-2xl">
                <Calculator size={24} />
              </div>
              <h3 className="text-xl font-serif text-brand-dark">Rate Estimator</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Select Carrier</label>
                <select
                  value={calcForm.carrier}
                  onChange={(e) => setCalcForm({ ...calcForm, carrier: e.target.value })}
                  className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold appearance-none"
                >
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                  <option value="ups">UPS</option>
                  <option value="usps">USPS</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Origin (Zip)</label>
                  <input
                    type="text"
                    value={calcForm.origin}
                    onChange={(e) => setCalcForm({ ...calcForm, origin: e.target.value })}
                    placeholder="90210"
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Dest (Zip)</label>
                  <input
                    type="text"
                    value={calcForm.destination}
                    onChange={(e) => setCalcForm({ ...calcForm, destination: e.target.value })}
                    placeholder="10001"
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={calcForm.weight}
                  onChange={(e) => setCalcForm({ ...calcForm, weight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">L (in)</label>
                  <input
                    type="number"
                    value={calcForm.length}
                    onChange={(e) => setCalcForm({ ...calcForm, length: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">W (in)</label>
                  <input
                    type="number"
                    value={calcForm.width}
                    onChange={(e) => setCalcForm({ ...calcForm, width: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-1">H (in)</label>
                  <input
                    type="number"
                    value={calcForm.height}
                    onChange={(e) => setCalcForm({ ...calcForm, height: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-brand-cream/30 border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <button
                onClick={handleCalculateRates}
                disabled={isCalculating}
                className="w-full bg-brand-dark text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center space-x-2"
              >
                {isCalculating ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={16} />}
                <span>{isCalculating ? 'Fetching Rates...' : 'Get Live Rates'}</span>
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2 space-y-6">
            {calcResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calcResults.map((rate, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="bg-white p-6 rounded-3xl border border-brand-dark/5 shadow-sm hover:border-brand-gold transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{rate.carrier}</p>
                        <h4 className="text-lg font-serif text-brand-dark">{rate.serviceName}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-serif text-brand-dark">${rate.cost.toFixed(2)}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30">{rate.currency}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-brand-dark/60">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-brand-gold" />
                        <span>{rate.estimatedDaysMin}-{rate.estimatedDaysMax} Days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Insured</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 bg-brand-cream/10 rounded-[2.5rem] border-2 border-dashed border-brand-dark/5">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-brand-dark/10">
                  <Activity size={40} />
                </div>
                <h3 className="text-xl font-serif text-brand-dark">No Estimates Yet</h3>
                <p className="text-brand-dark/40 text-sm mt-2">Enter package details and zip codes to see live carrier rates.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Zone Modal */}
      <AnimatePresence>
        {(isAddingZone || editingZone) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingZone(false); setEditingZone(null); }}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/10">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-brand-dark text-white rounded-2xl">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-brand-dark">
                      {isAddingZone ? 'Add Shipping Zone' : 'Edit Shipping Zone'}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                      Configure regions and shipping methods
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsAddingZone(false); setEditingZone(null); }}
                  className="p-3 hover:bg-brand-cream rounded-2xl text-brand-dark/40 hover:text-brand-dark transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 ml-1">Zone Name</label>
                      <input
                        type="text"
                        value={isAddingZone ? zoneForm.name : editingZone?.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isAddingZone) {
                            setZoneForm({ ...zoneForm, name: val });
                          } else if (editingZone) {
                            setEditingZone({ ...editingZone, name: val });
                          }
                          if (validationErrors.name) {
                            setValidationErrors(prev => {
                              const next = { ...prev };
                              delete next.name;
                              return next;
                            });
                          }
                        }}
                        placeholder="e.g., North America, Domestic Standard"
                        className={`w-full bg-brand-cream/30 border rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all ${
                          validationErrors.name ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                        }`}
                      />
                      {validationErrors.name && (
                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest ml-1 flex items-center space-x-1">
                          <AlertCircle size={10} />
                          <span>{validationErrors.name}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40 ml-1">Zone Type</label>
                      <div className="flex p-1 bg-brand-cream/30 rounded-2xl border border-brand-dark/5">
                        <button
                          onClick={() => isAddingZone 
                            ? setZoneForm({ ...zoneForm, type: 'domestic' })
                            : setEditingZone(editingZone ? { ...editingZone, type: 'domestic' } : null)
                          }
                          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            (isAddingZone ? zoneForm.type : editingZone?.type) === 'domestic'
                              ? 'bg-white text-brand-dark shadow-sm'
                              : 'text-brand-dark/40 hover:text-brand-dark'
                          }`}
                        >
                          <Home size={14} />
                          <span>Domestic</span>
                        </button>
                        <button
                          onClick={() => isAddingZone 
                            ? setZoneForm({ ...zoneForm, type: 'international' })
                            : setEditingZone(editingZone ? { ...editingZone, type: 'international' } : null)
                          }
                          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            (isAddingZone ? zoneForm.type : editingZone?.type) === 'international'
                              ? 'bg-white text-brand-dark shadow-sm'
                              : 'text-brand-dark/40 hover:text-brand-dark'
                          }`}
                        >
                          <Globe size={14} />
                          <span>International</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">Regions</label>
                      <span className="text-[9px] text-brand-dark/30 italic">Separate with commas</span>
                    </div>
                    <input
                      type="text"
                      value={isAddingZone ? zoneForm.regions?.join(', ') : editingZone?.regions.join(', ')}
                      onChange={(e) => {
                        const regions = e.target.value.split(',').map(r => r.trim()).filter(r => r !== '');
                        if (isAddingZone) {
                          setZoneForm({ ...zoneForm, regions });
                        } else if (editingZone) {
                          setEditingZone({ ...editingZone, regions });
                        }
                        if (validationErrors.regions) {
                          setValidationErrors(prev => {
                            const next = { ...prev };
                            delete next.regions;
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g., USA, Canada, UK or All Regions"
                      className={`w-full bg-brand-cream/30 border rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all ${
                        validationErrors.regions ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                      }`}
                    />
                    {validationErrors.regions && (
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest ml-1 flex items-center space-x-1">
                        <AlertCircle size={10} />
                        <span>{validationErrors.regions}</span>
                      </p>
                    )}
                  </div>

                  {/* Shipping Methods */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-serif text-brand-dark">Shipping Methods</h4>
                      <button
                        onClick={() => addOptionToForm(!!editingZone)}
                        className="flex items-center space-x-2 text-brand-gold hover:text-brand-dark transition-colors text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Plus size={14} />
                        <span>Add Method</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(isAddingZone ? zoneForm.options : editingZone?.options)?.map((option) => (
                        <div key={option.id} className="bg-brand-cream/20 p-6 rounded-3xl border border-brand-dark/5 relative group">
                          <button
                            onClick={() => removeOptionFromForm(option.id, !!editingZone)}
                            className="absolute top-4 right-4 p-2 text-brand-dark/20 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Method Name</label>
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => updateOptionInForm(option.id, { name: e.target.value }, !!editingZone)}
                                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                                  validationErrors[`option_${option.id}_name`] ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                                }`}
                              />
                              {validationErrors[`option_${option.id}_name`] && (
                                <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest ml-1">{validationErrors[`option_${option.id}_name`]}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Cost ($)</label>
                              <div className="relative">
                                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" />
                                <input
                                  type="number"
                                  value={option.cost}
                                  onChange={(e) => updateOptionInForm(option.id, { cost: parseFloat(e.target.value) || 0 }, !!editingZone)}
                                  className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all ${
                                    validationErrors[`option_${option.id}_cost`] ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                                  }`}
                                />
                              </div>
                              {validationErrors[`option_${option.id}_cost`] && (
                                <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest ml-1">{validationErrors[`option_${option.id}_cost`]}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Delivery (Days)</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={option.estimatedDaysMin}
                                  onChange={(e) => updateOptionInForm(option.id, { estimatedDaysMin: parseInt(e.target.value) || 0 }, !!editingZone)}
                                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-center ${
                                    validationErrors[`option_${option.id}_min`] ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                                  }`}
                                />
                                <span className="text-brand-dark/20">-</span>
                                <input
                                  type="number"
                                  value={option.estimatedDaysMax}
                                  onChange={(e) => updateOptionInForm(option.id, { estimatedDaysMax: parseInt(e.target.value) || 0 }, !!editingZone)}
                                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-center ${
                                    validationErrors[`option_${option.id}_max`] ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                                  }`}
                                />
                              </div>
                              {(validationErrors[`option_${option.id}_min`] || validationErrors[`option_${option.id}_max`]) && (
                                <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest ml-1">
                                  {validationErrors[`option_${option.id}_min`] || validationErrors[`option_${option.id}_max`]}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                             <div className="space-y-2">
                               <div className="flex items-center space-x-1">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Link to Carrier (Optional)</label>
                                 <div className="group relative">
                                   <Activity size={10} className="text-brand-dark/20 cursor-help" />
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-brand-dark text-white text-[8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                     Select a carrier to enable real-time rate calculation for this method.
                                   </div>
                                 </div>
                               </div>
                               <select
                                 value={option.carrier || ''}
                                 onChange={(e) => updateOptionInForm(option.id, { carrier: e.target.value as any || undefined }, !!editingZone)}
                                 className="w-full bg-white border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold appearance-none"
                               >
                                 <option value="">Manual Rate</option>
                                 <option value="fedex">FedEx</option>
                                 <option value="dhl">DHL</option>
                                 <option value="ups">UPS</option>
                                 <option value="usps">USPS</option>
                               </select>
                             </div>
                             <div className="space-y-2">
                               <div className="flex items-center space-x-1">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40">Service Code</label>
                                 <div className="group relative">
                                   <Activity size={10} className="text-brand-dark/20 cursor-help" />
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-brand-dark text-white text-[8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                     The specific carrier service identifier (e.g., PRIORITY_OVERNIGHT).
                                   </div>
                                 </div>
                               </div>
                               <input
                                 type="text"
                                 value={option.serviceCode || ''}
                                 onChange={(e) => updateOptionInForm(option.id, { serviceCode: e.target.value }, !!editingZone)}
                                 placeholder="e.g., FEDEX_GROUND"
                                 className="w-full bg-white border border-brand-dark/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold"
                               />
                             </div>
                          </div>

                          {/* Regional Overrides for International Zones */}
                          {(isAddingZone ? zoneForm.type : editingZone?.type) === 'international' && (
                            <div className="mt-6 pt-6 border-t border-brand-dark/5">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                  <Layers size={14} className="text-brand-gold" />
                                  <h5 className="text-xs font-bold uppercase tracking-widest text-brand-dark">Regional Overrides</h5>
                                </div>
                                <button
                                  onClick={() => addOverrideToOption(option.id, !!editingZone)}
                                  className="text-[9px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-dark transition-colors flex items-center space-x-1"
                                >
                                  <Plus size={12} />
                                  <span>Add Override</span>
                                </button>
                              </div>

                              <div className="space-y-3">
                                {option.overrides?.map((override) => (
                                  <div key={override.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-brand-dark/5 relative group/override">
                                    <button
                                      onClick={() => removeOverrideFromOption(option.id, override.id, !!editingZone)}
                                      className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-sm opacity-0 group-hover/override:opacity-100 transition-all"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                     <div className="md:col-span-1 space-y-1">
                                       <label className="text-[8px] font-bold uppercase tracking-widest text-brand-dark/30">Region</label>
                                       <input
                                         type="text"
                                         value={override.region}
                                         onChange={(e) => updateOverrideInOption(option.id, override.id, { region: e.target.value }, !!editingZone)}
                                         placeholder="e.g., UK"
                                         className={`w-full bg-brand-cream/10 border rounded-lg px-3 py-2 text-xs focus:outline-none transition-all ${
                                           validationErrors[`override_${override.id}_region`] ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                                         }`}
                                       />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[8px] font-bold uppercase tracking-widest text-brand-dark/30">Cost ($)</label>
                                       <input
                                         type="number"
                                         value={override.cost}
                                         onChange={(e) => updateOverrideInOption(option.id, override.id, { cost: parseFloat(e.target.value) || 0 }, !!editingZone)}
                                         className={`w-full bg-brand-cream/10 border rounded-lg px-3 py-2 text-xs focus:outline-none transition-all ${
                                           validationErrors[`override_${override.id}_cost`] ? 'border-rose-500 focus:border-rose-500' : 'border-brand-dark/5 focus:border-brand-gold'
                                         }`}
                                       />
                                     </div>
                                    <div className="md:col-span-2 space-y-1">
                                      <label className="text-[8px] font-bold uppercase tracking-widest text-brand-dark/30">Delivery (Days)</label>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="number"
                                          value={override.estimatedDaysMin}
                                          onChange={(e) => updateOverrideInOption(option.id, override.id, { estimatedDaysMin: parseInt(e.target.value) || 0 }, !!editingZone)}
                                          className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-center"
                                        />
                                        <span className="text-brand-dark/20">-</span>
                                        <input
                                          type="number"
                                          value={override.estimatedDaysMax}
                                          onChange={(e) => updateOverrideInOption(option.id, override.id, { estimatedDaysMax: parseInt(e.target.value) || 0 }, !!editingZone)}
                                          className="w-full bg-brand-cream/10 border border-brand-dark/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-gold text-center"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {(!option.overrides || option.overrides.length === 0) && (
                                  <p className="text-[10px] text-brand-dark/30 italic text-center py-2">No regional overrides defined for this method.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {(isAddingZone ? zoneForm.options?.length : editingZone?.options.length) === 0 && (
                        <div className="text-center py-12 bg-brand-cream/10 rounded-3xl border-2 border-dashed border-brand-dark/5">
                          <p className="text-brand-dark/30 text-sm">Add at least one shipping method to this zone.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-brand-dark/5 bg-brand-cream/10 flex items-center justify-end space-x-4">
                <button
                  onClick={() => { setIsAddingZone(false); setEditingZone(null); }}
                  className="px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-brand-dark/60 hover:bg-brand-cream transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={isAddingZone ? handleAddZone : handleUpdateZone}
                  className="bg-brand-dark text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-lg shadow-brand-dark/20 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{isAddingZone ? 'Create Zone' : 'Save Changes'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingManagement;
