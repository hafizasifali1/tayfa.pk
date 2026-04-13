import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, Save, Download, Package, Ticket, Tag, Sparkles, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BulkUploadType } from '../../types';
import { auditService } from '../../services/auditService';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const BulkUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState<BulkUploadType>('product');
  const [csvData, setCsvData] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});

  const getRequiredHeaders = (type: BulkUploadType) => {
    switch (type) {
      case 'product': return ['name', 'brand', 'price', 'parentCategoryId', 'categoryId', 'description', 'stock'];
      case 'pricelist': return ['name', 'description', 'currency', 'productid', 'price'];
      case 'promotion': return ['name', 'description', 'type', 'value', 'startdate', 'enddate'];
      case 'coupon': return ['code', 'description', 'discounttype', 'discountvalue', 'minpurchase', 'expirydate', 'usagelimit'];
      default: return [];
    }
  };

  const processCSV = (content: string, customMapping?: Record<string, string>) => {
    setError(null);
    setValidationErrors({});
    if (!content.trim()) {
      setError('Please provide CSV data.');
      return;
    }

    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields?.map(h => h.trim()) || [];
        const requiredHeaders = getRequiredHeaders(uploadType);
        
        // Use custom mapping if provided, otherwise calculate initial mapping
        let currentMapping = customMapping;
        if (!currentMapping) {
          currentMapping = {};
          headers.forEach(h => {
            const normalized = h.toLowerCase().replace(/[^a-z0-9]/g, '');
            const match = requiredHeaders.find(rh => rh.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
            if (match) {
              currentMapping![h] = match;
            } else if (uploadType === 'product') {
              currentMapping![h] = 'custom_field';
            } else {
              currentMapping![h] = 'ignore';
            }
          });
          setFieldMapping(currentMapping);
        }

        const data = results.data.map((row: any, index) => {
          const item: any = { _originalIndex: index };
          const rowErrors: string[] = [];

          headers.forEach(header => {
            const mapping = currentMapping![header];
            const value = row[header]?.trim();

            if (!mapping || mapping === 'ignore') return;

            if (mapping === 'custom_field') {
              if (!item.customFields) item.customFields = {};
              item.customFields[header] = value;
              return;
            }

            // Type conversion and basic validation
            if (['price', 'stock', 'value', 'discountvalue', 'minpurchase', 'usagelimit'].includes(mapping)) {
              const num = parseFloat(value);
              if (isNaN(num)) {
                rowErrors.push(`${header} must be a number`);
                item[mapping] = 0;
              } else {
                item[mapping] = num;
              }
            } else {
              item[mapping] = value;
            }
          });

          // Check for missing required fields
          requiredHeaders.forEach(rh => {
            if (!item[rh] && item[rh] !== 0) {
              rowErrors.push(`${rh} is required`);
            }
          });

          if (rowErrors.length > 0) {
            setValidationErrors(prev => ({ ...prev, [index]: rowErrors }));
          }

          return item;
        });

        setParsedData(data);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        processCSV(text);
      };
      reader.readAsText(file);
    }
  }, [uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  const handleParse = (mapping?: Record<string, string>) => {
    processCSV(csvData, mapping);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      const cleanData = Array.isArray(parsedData) ? parsedData.map(p => {
        const { _originalIndex, ...rest } = p;
        return rest;
      }) : [];

      const response = await axios.post('/api/bulk-upload', {
        type: uploadType,
        data: cleanData,
        sellerId: user.id
      });

      if (response.data.success) {
        auditService.logAction(
          { id: user.id, name: user.fullName, role: user.role as any },
          `Bulk Upload: ${uploadType}`,
          uploadType as any,
          `Uploaded ${response.data.count} items via bulk CSV.`,
          'success'
        );
        navigate('/seller/dashboard');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      setError('Failed to process bulk upload. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = getRequiredHeaders(uploadType).join(',');
    let example = '';
    if (uploadType === 'product') example = 'Silk Saree,brand-id,120,parent-cat-id,child-cat-id,Beautiful silk saree,50';
    if (uploadType === 'pricelist') example = 'Summer Sale,Summer discounts,USD,prod-123,99.99';
    if (uploadType === 'promotion') example = 'Black Friday,Huge discounts,percentage,20,2024-11-20,2024-11-30';
    if (uploadType === 'coupon') example = 'SAVE20,20% off on all items,percentage,20,100,2024-12-31,500';

    const blob = new Blob([`${headers}\n${example}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tayfa_bulk_${uploadType}_template.csv`;
    a.click();
  };

  const uploadTypes = [
    { id: 'product', label: 'Products', icon: Package },
    { id: 'pricelist', label: 'Pricelists', icon: FileText },
    { id: 'promotion', label: 'Promotions', icon: Sparkles },
    { id: 'coupon', label: 'Coupons', icon: Ticket },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif mb-1 sm:mb-2">Bulk Management</h1>
            <p className="text-xs sm:text-sm text-brand-dark/60">Upload and manage multiple items at once using CSV format.</p>
          </div>
          <button 
            onClick={downloadTemplate}
            className="flex items-center space-x-2 text-brand-gold hover:text-brand-dark transition-colors text-[10px] sm:text-sm font-bold uppercase tracking-widest w-fit"
          >
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>Download Template</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {uploadTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setUploadType(type.id as BulkUploadType);
                setParsedData([]);
                setError(null);
                setCsvData('');
              }}
              className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all ${
                uploadType === type.id 
                  ? 'bg-brand-dark text-white border-brand-dark shadow-xl scale-105' 
                  : 'bg-white text-brand-dark/40 border-brand-dark/5 hover:border-brand-gold/20'
              }`}
            >
              <type.icon size={20} className="mb-2 sm:mb-3 sm:w-6 sm:h-6" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-brand-dark/5 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 text-brand-dark">
                <FileUp size={20} className="sm:w-6 sm:h-6" />
                <h2 className="text-lg sm:text-xl font-serif">Upload CSV</h2>
              </div>

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center transition-all cursor-pointer ${
                  isDragActive ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-dark/10 hover:border-brand-gold/40'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-3 sm:mb-4 text-brand-dark/20 w-8 h-8 sm:w-12 sm:h-12" />
                <p className="text-xs sm:text-sm text-brand-dark/60">Drag & drop your CSV file here, or click to select</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-brand-dark/30 mt-2">Only .csv files are supported</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-dark/5"></div>
                </div>
                <div className="relative flex justify-center text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-white px-4 text-brand-dark/30">Or Paste Data</span>
                </div>
              </div>
              
              <textarea 
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={`${getRequiredHeaders(uploadType).join(',')}...`}
                className="w-full h-32 sm:h-48 bg-brand-cream/30 border-none rounded-xl sm:rounded-2xl p-4 sm:p-6 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-brand-gold/20 resize-none"
              />

              {error && (
                <div className="flex items-center space-x-2 text-rose-500 bg-rose-50 p-3 sm:p-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                onClick={() => handleParse()}
                className="w-full bg-brand-dark text-white py-3 sm:py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm"
              >
                <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Parse & Preview</span>
              </button>

              {parsedData.length > 0 && (
                <div className="pt-6 border-t border-brand-dark/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-dark">Field Mapping</h3>
                    <span className="text-[8px] sm:text-[10px] text-brand-dark/40 font-bold uppercase">Map CSV columns to fields</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {Array.isArray(Object.entries(fieldMapping)) && Object.entries(fieldMapping).map(([csvHeader, mappedField]) => (
                      <div key={csvHeader} className="flex items-center justify-between p-2 sm:p-3 bg-brand-cream/10 rounded-xl border border-brand-dark/5">
                        <span className="text-[8px] sm:text-[10px] font-bold text-brand-dark truncate max-w-[100px] sm:max-w-[120px]">{csvHeader}</span>
                        <select 
                          value={mappedField}
                          onChange={(e) => {
                            const newMapping = { ...fieldMapping, [csvHeader]: e.target.value };
                            setFieldMapping(newMapping);
                            // Re-process with new mapping
                            handleParse(newMapping);
                          }}
                          className="bg-white border-none rounded-lg px-2 sm:px-3 py-1 text-[8px] sm:text-[10px] font-bold focus:ring-1 focus:ring-brand-gold/20"
                        >
                          <option value="ignore">Ignore</option>
                          {Array.isArray(getRequiredHeaders(uploadType)) && getRequiredHeaders(uploadType).map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                          {uploadType === 'product' && <option value="custom_field">Custom Field</option>}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-brand-gold/5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-gold/10">
              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-3 sm:mb-4">Instructions</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-brand-dark/60 leading-relaxed">
                <li>• Ensure all required columns are present in the first line.</li>
                <li>• Use commas to separate values.</li>
                <li>• Numeric fields must contain only numbers.</li>
                <li>• Dates should be in YYYY-MM-DD format.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-brand-dark/5 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 text-brand-dark">
                <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
                <h2 className="text-lg sm:text-xl font-serif">Preview ({parsedData.length})</h2>
              </div>
              {parsedData.length > 0 && (
                <button 
                  onClick={() => setParsedData([])}
                  className="text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            <div className="flex-grow overflow-y-auto max-h-[400px] sm:max-h-[500px] space-y-3 sm:space-y-4 pr-2 custom-scrollbar">
              {Array.isArray(parsedData) && parsedData.length > 0 ? (
                parsedData.map((item, idx) => {
                  const errors = validationErrors[item._originalIndex];
                  return (
                    <div key={idx} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${errors ? 'bg-rose-50 border-rose-200' : 'bg-brand-cream/20 border-brand-dark/5'}`}>
                      <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                        <h4 className={`font-bold text-xs sm:text-sm ${errors ? 'text-rose-600' : ''}`}>{item.name || item.code || 'Unnamed Item'}</h4>
                        {item.price && <span className="text-[10px] sm:text-xs font-bold text-brand-gold">${item.price}</span>}
                        {item.discountvalue && <span className="text-[10px] sm:text-xs font-bold text-brand-gold">{item.discountvalue}{item.discounttype === 'percentage' ? '%' : '$'}</span>}
                        {item.value && <span className="text-[10px] sm:text-xs font-bold text-brand-gold">{item.value}{item.type === 'percentage' ? '%' : '$'}</span>}
                      </div>
                      
                      {Array.isArray(errors) && errors.length > 0 && (
                        <div className="mb-2 sm:mb-3 space-y-1">
                          {errors.map((err, i) => (
                            <p key={i} className="text-[8px] sm:text-[10px] text-rose-500 font-bold uppercase flex items-center">
                              <AlertCircle size={8} className="mr-1 sm:w-2.5 sm:h-2.5" />
                              {err}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] uppercase tracking-widest text-brand-dark/40 font-bold">
                        {Array.isArray(Object.entries(item)) && Object.entries(item).filter(([k]) => !k.startsWith('_')).slice(0, 6).map(([key, val]) => (
                          <span key={key} className="truncate">
                            {key}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-brand-dark/20 space-y-3 sm:space-y-4 py-16 sm:py-20">
                  <Package size={48} className="sm:w-16 sm:h-16" />
                  <p className="text-xs sm:text-sm italic">No items to preview yet.</p>
                </div>
              )}
            </div>

            {parsedData.length > 0 && (
              <button 
                onClick={handleSave}
                disabled={isProcessing || Object.keys(validationErrors).length > 0}
                className="w-full mt-6 bg-emerald-500 text-white py-3 sm:py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-xs sm:text-sm"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                )}
                <span>{isProcessing ? 'Uploading...' : Object.keys(validationErrors).length > 0 ? 'Fix Errors to Upload' : 'Confirm & Upload'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    );
};

export default BulkUpload;
