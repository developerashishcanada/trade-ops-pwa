import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, Ship, CheckSquare, BookOpen, Plus, X, 
  AlertTriangle, FileText, Calendar, ChevronRight, CheckCircle2, Bell
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [queueScope, setQueueScope] = useState('all'); 
  
  // New Filter States
  const [dealFilter, setDealFilter] = useState('all'); // 'all' | 'highSeas'
  const [queueStatusFilter, setQueueStatusFilter] = useState('all'); // 'all' | 'Pending' | 'Delayed'

  const [stepMaster, setStepMaster] = useState([]);
  const currentUserEmail = 'developerashish.canada@gmail.com';

  const API_URL = "https://script.google.com/macros/s/AKfycbw9MdLjtVh_clisQj_FS9WrOiLZDMEzTca-XHD4S1Ehvgk7BVNoiBWLAs3d87wbyRnH/exec";

  const [deals, setDeDeals] = useState([]);
  const [steps, setSteps] = useState([]);

  // Fetch existing data and StepMaster rules from Google Sheet on load / refresh
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const json = await response.json();
        if (json.status === 'success') {
          const mappedDeals = (json.deals || []).map(d => ({
            id: d.DealID !== undefined && d.DealID !== null ? String(d.DealID).trim() : '',
            buyer: d.Buyer || '',
            supplier: d.Supplier || '',
            shipmentDate: d.ShipmentDate ? String(d.ShipmentDate).split('T')[0] : '',
            destinationDate: d.DestinationDate ? String(d.DestinationDate).split('T')[0] : '',
            highSeas: d.HighSeas || 'No',
            status: 'In flight' 
          })).filter(d => d.id); 
          
          const mappedSteps = (json.steps || []).map(s => ({
            id: s.StepID !== undefined && s.StepID !== null ? String(s.StepID).trim() : '',
            dealId: s.DealID !== undefined && s.DealID !== null ? String(s.DealID).trim() : '',
            name: s.StepName || '',
            assignedEmail: s.AssignedTo || '',
            dueDate: s.Deadline ? String(s.Deadline).split('T')[0] : '',
            actualDate: s.ActualDate ? String(s.ActualDate).split('T')[0] : '',
            status: s.Status || 'Pending',
            docRef: s.DocumentReference || ''
          })).filter(s => s.id);

          const mappedMaster = (json.stepMaster || []).map(m => ({
            stepName: m.StepName || '',
            rule: Number(m.Rule) || 0,
            emailId: m.EmailID || 'ops@company.com'
          })).filter(m => m.stepName);

          setDeDeals(mappedDeals.reverse());
          setSteps(mappedSteps);
          setStepMaster(mappedMaster);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    id: `AV-2026-${Math.floor(100 + Math.random() * 900)}`,
    buyer: '',
    supplier: '',
    shipmentDate: '',
    destinationDate: '',
    highSeas: 'No'
  });

  const metrics = useMemo(() => {
    const liveDeals = deals.length;
    const highSeas = deals.filter(d => String(d.highSeas).toLowerCase() === 'yes' || String(d.highSeas).toLowerCase() === 'y').length;
    const delayedSteps = steps.filter(s => s.status.toLowerCase() === 'delayed').length;
    const pendingSteps = steps.filter(s => s.status.toLowerCase() === 'pending').length;
    return { liveDeals, highSeas, delayedSteps, pendingSteps };
  }, [deals, steps]);

  // Filtered Deals List
  const filteredDeals = useMemo(() => {
    if (dealFilter === 'highSeas') {
      return deals.filter(d => String(d.highSeas).toLowerCase() === 'yes' || String(d.highSeas).toLowerCase() === 'y');
    }
    return deals;
  }, [deals, dealFilter]);

  // Filtered Queue Steps List
  const filteredQueueSteps = useMemo(() => {
    let list = steps.filter(s => s.status !== 'Done');
    if (queueStatusFilter !== 'all') {
      list = list.filter(s => s.status.toLowerCase() === queueStatusFilter.toLowerCase());
    }
    if (queueScope === 'my') {
      list = list.filter(s => s.assignedEmail.toLowerCase() === currentUserEmail.toLowerCase());
    }
    return list;
  }, [steps, queueStatusFilter, queueScope, currentUserEmail]);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.buyer || !formData.shipmentDate) return;

    const dbDeal = {
      DealID: formData.id,
      Buyer: formData.buyer,
      Supplier: formData.supplier || 'Unassigned',
      ShipmentDate: formData.shipmentDate,
      DestinationDate: formData.destinationDate,
      HighSeas: formData.highSeas
    };

    const rulesToUse = stepMaster.length > 0 ? stepMaster : [
      { stepName: 'Deal Closure', rule: 7, emailId: 'sales@company.com' },
      { stepName: 'Loading', rule: 14, emailId: 'satya223@gmail.com' },
      { stepName: 'PSIC', rule: 21, emailId: 'docs@company.com' },
      { stepName: 'Loaded to Ship', rule: 28, emailId: 'ops@company.com' },
      { stepName: 'Draft Bill of Lading (BL)', rule: 35, emailId: 'docs@company.com' },
      { stepName: 'High Seas Contract', rule: 42, emailId: 'legal@company.com' },
      { stepName: 'Port Change (If Needed)', rule: 49, emailId: 'ops@company.com' },
      { stepName: 'Telex Release / Final BL', rule: 56, emailId: 'docs@company.com' },
      { stepName: 'Custom Clearance', rule: 63, emailId: 'satya223@gmail.com' },
      { stepName: 'Make Invoice', rule: 70, emailId: 'finance@company.com' },
      { stepName: 'Receive Buyer Payment', rule: 77, emailId: 'finance@company.com' },
      { stepName: 'Pay Supplier (Close Deal)', rule: 84, emailId: 'finance@company.com' }
    ];

    const dbSteps = rulesToUse.map((rule, idx) => {
      const baseDate = new Date(formData.shipmentDate);
      baseDate.setDate(baseDate.getDate() + (Number(rule.rule) || (idx * 7)));
      return {
        StepID: `${formData.id}-${idx + 1}`,
        DealID: formData.id,
        StepName: rule.stepName,
        AssignedTo: rule.emailId,
        Deadline: baseDate.toISOString().split('T')[0],
        ActualDate: '',
        Status: 'Pending',
        DocumentReference: ''
      };
    });

    const payload = { action: 'createDeal', ...dbDeal, steps: dbSteps };

    setDeDeals([{
      id: dbDeal.DealID, buyer: dbDeal.Buyer, supplier: dbDeal.Supplier, 
      shipmentDate: dbDeal.ShipmentDate, destinationDate: dbDeal.DestinationDate, 
      highSeas: dbDeal.HighSeas, status: 'In flight'
    }, ...deals]);
    
    setSteps([...steps, ...dbSteps.map(s => ({
      id: s.StepID, dealId: s.DealID, name: s.StepName, assignedEmail: s.AssignedTo, 
      dueDate: s.Deadline, actualDate: s.ActualDate, status: s.Status, docRef: s.DocumentReference
    }))]);
    
    setShowAddModal(false);
    setFormData({
      id: `AV-2026-${Math.floor(100 + Math.random() * 900)}`,
      buyer: '',
      supplier: '',
      shipmentDate: '',
      destinationDate: '',
      highSeas: 'No'
    });

    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    } catch (error) {
      console.error("Failed to save to Google Sheets", error);
    }
  };

  const handleUpdateStep = async (e) => {
    e.preventDefault();
    if (!editingStep) return;

    setSteps(steps.map(s => s.id === editingStep.id ? editingStep : s));
    
    const payload = {
      action: 'updateStep',
      StepID: editingStep.id,
      Status: editingStep.status,
      ActualDate: editingStep.actualDate,
      DocumentReference: editingStep.docRef
    };

    setEditingStep(null);

    try {
      await fetch(API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    } catch (error) {
      console.error("Failed to update step", error);
    }
  };

  const selectedDeal = deals.find(d => d.id === selectedDealId);
  const selectedDealSteps = steps.filter(s => s.dealId === selectedDealId);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-24 border-x border-slate-100 flex flex-col justify-between select-none">
      <div className="p-4 flex-1">
        {activeTab === 'overview' && !selectedDealId && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trade Operations Console</h1>
              <button onClick={() => { setDealFilter('all'); setActiveTab('deals'); }} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition">
                <span>&rarr;</span> Open deals
              </button>
            </div>

            {/* Clickable & Filtering Metric Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div 
                onClick={() => { setDealFilter('all'); setActiveTab('deals'); }}
                className="border border-slate-200 rounded-xl p-3.5 bg-white hover:border-brand-500 hover:shadow-sm transition cursor-pointer group"
              >
                <p className="text-xs font-medium text-slate-500 group-hover:text-brand-600 transition">Live deals &rarr;</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.liveDeals}</p>
                <p className="text-[11px] text-slate-400">Across active routes</p>
              </div>

              <div 
                onClick={() => { setDealFilter('highSeas'); setActiveTab('deals'); }}
                className="border border-slate-200 rounded-xl p-3.5 bg-white hover:border-brand-500 hover:shadow-sm transition cursor-pointer group"
              >
                <p className="text-xs font-medium text-slate-500 group-hover:text-brand-600 transition">High seas &rarr;</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.highSeas}</p>
                <p className="text-[11px] text-slate-400">Require close watch</p>
              </div>

              <div 
                onClick={() => { setQueueStatusFilter('Delayed'); setActiveTab('queue'); }}
                className="border border-slate-200 rounded-xl p-3.5 bg-white hover:border-brand-500 hover:shadow-sm transition cursor-pointer group"
              >
                <p className="text-xs font-medium text-slate-500 group-hover:text-brand-600 transition">Delayed steps &rarr;</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.delayedSteps}</p>
                <p className="text-[11px] text-slate-400">Require action</p>
              </div>

              <div 
                onClick={() => { setQueueStatusFilter('Pending'); setActiveTab('queue'); }}
                className="border border-slate-200 rounded-xl p-3.5 bg-white hover:border-brand-500 hover:shadow-sm transition cursor-pointer group"
              >
                <p className="text-xs font-medium text-slate-500 group-hover:text-brand-600 transition">Pending steps &rarr;</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.pendingSteps}</p>
                <p className="text-[11px] text-slate-400">Awaiting operator update</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-900">Attention queue</h2>
              <button onClick={() => { setQueueStatusFilter('all'); setActiveTab('queue'); }} className="text-xs font-semibold text-brand-600 hover:underline">Open queue</button>
            </div>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {steps.filter(s => s.status !== 'Done').slice(0, 7).map((step) => (
                <div key={step.id} onClick={() => setEditingStep(step)} className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{step.name} &middot; {step.dealId}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{step.assignedEmail} &middot; Due {step.dueDate}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${step.status === 'Delayed' ? 'bg-red-100 text-red-700' : 'bg-amber-100/70 text-amber-700'}`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deals' && !selectedDealId && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl font-bold text-slate-900">Deals</h1>
              <button onClick={() => setShowAddModal(true)} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition">
                <Plus className="w-3.5 h-3.5" /> New deal
              </button>
            </div>

            {/* Deal Filter Dropdown */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-700 block mb-1">Deal filter</label>
              <select 
                value={dealFilter}
                onChange={(e) => setDealFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All deals ({deals.length})</option>
                <option value="highSeas">High seas only ({metrics.highSeas})</option>
              </select>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden mt-4">
              {filteredDeals.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No deals match the selected filter.</div>
              ) : (
                filteredDeals.map((deal) => (
                  <div key={deal.id} onClick={() => setSelectedDealId(deal.id)} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Ship className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{deal.id} &middot; {deal.buyer}</p>
                        <p className="text-[11px] text-slate-500">{deal.supplier} &middot; Ship {deal.shipmentDate}</p>
                      </div>
                    </div>
                    <span className="bg-amber-100/70 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{deal.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedDealId && selectedDeal && (
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
              <span className="cursor-pointer hover:underline" onClick={() => setSelectedDealId(null)}>Deals</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>{selectedDeal.id}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-3">{selectedDeal.id} &middot; {selectedDeal.buyer}</h1>
            
            <div className="border border-slate-200 rounded-xl p-4 bg-white mb-4 text-xs space-y-2">
              <p><span className="font-semibold text-slate-500">Supplier:</span> {selectedDeal.supplier}</p>
              <p><span className="font-semibold text-slate-500">Shipment Date:</span> {selectedDeal.shipmentDate}</p>
              <p><span className="font-semibold text-slate-500">Destination Date:</span> {selectedDeal.destinationDate || 'N/A'}</p>
              <p><span className="font-semibold text-slate-500">High Seas:</span> {selectedDeal.highSeas}</p>
            </div>

            <div className="flex justify-between items-center mb-3 mt-5">
              <h2 className="text-sm font-bold text-slate-900">Lifecycle steps</h2>
              <span className="text-xs text-slate-400">{selectedDealSteps.length} steps</span>
            </div>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {selectedDealSteps.map((step) => (
                <div key={step.id} onClick={() => setEditingStep(step)} className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{step.name}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{step.assignedEmail} &middot; Due {step.dueDate}</p>
                      {step.actualDate && <p className="text-[10px] text-brand-600 mt-0.5 font-medium">Completed: {step.actualDate}</p>}
                      {step.docRef && <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Ref: {step.docRef}</p>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    step.status === 'Done' ? 'bg-green-100 text-green-700' : 
                    step.status === 'Delayed' ? 'bg-red-100 text-red-700' : 
                    'bg-amber-100/70 text-amber-700'
                  }`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-3">Queue &amp; Actions</h1>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Status Filter</label>
                <select 
                  value={queueStatusFilter} 
                  onChange={(e) => setQueueStatusFilter(e.target.value)} 
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 text-slate-800 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">Assignment</label>
                <select 
                  value={queueScope} 
                  onChange={(e) => setQueueScope(e.target.value)} 
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 text-slate-800 focus:outline-none"
                >
                  <option value="all">All team steps</option>
                  <option value="my">My assigned steps</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {filteredQueueSteps.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No steps match the active filter criteria.</div>
              ) : (
                filteredQueueSteps.map((step) => (
                  <div key={step.id} onClick={() => setEditingStep(step)} className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">{step.name} &middot; {step.dealId}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{step.assignedEmail} &middot; Due {step.dueDate}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${step.status === 'Delayed' ? 'bg-red-100 text-red-700' : 'bg-amber-100/70 text-amber-700'}`}>
                      {step.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* UPDATE STEP MODAL WITH DEADLINE DISPLAY */}
      {editingStep && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-end justify-center backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Update Step</h2>
                <p className="text-[11px] text-slate-500">{editingStep.name} &middot; {editingStep.dealId}</p>
              </div>
              <button onClick={() => setEditingStep(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdateStep} className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                <span className="font-semibold text-slate-500">Target Deadline</span>
                <span className="font-bold text-slate-800">{editingStep.dueDate || 'No deadline set'}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status</label>
                <select 
                  value={editingStep.status}
                  onChange={(e) => setEditingStep({...editingStep, status: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Done">Done</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Ontime">Ontime</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Actual Completion Date</label>
                <input 
                  type="date"
                  value={editingStep.actualDate}
                  onChange={(e) => setEditingStep({...editingStep, actualDate: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Reference (BL / Inv #)</label>
                <input 
                  type="text"
                  placeholder="e.g. BL-492911"
                  value={editingStep.docRef}
                  onChange={(e) => setEditingStep({...editingStep, docRef: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition mt-4">
                Save Updates
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DEAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-end justify-center backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-900">Add a new deal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deal ID</label>
                <input type="text" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50" required />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Buyer</label>
                <input type="text" placeholder="Buyer desk" value={formData.buyer} onChange={(e) => setFormData({...formData, buyer: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50" required />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier</label>
                <input type="text" placeholder="Supplier desk" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shipment date</label>
                <input type="date" value={formData.shipmentDate} onChange={(e) => setFormData({...formData, shipmentDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50" required />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destination date</label>
                <input type="date" value={formData.destinationDate} onChange={(e) => setFormData({...formData, destinationDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">High-seas handling</label>
                <select value={formData.highSeas} onChange={(e) => setFormData({...formData, highSeas: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg mt-2">+ Create deal</button>
            </form>
          </div>
        </div>
      )}

      {/* NAV BAR */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-sm border-t border-slate-200 px-6 py-2 flex justify-between items-center z-40">
        <button onClick={() => { setActiveTab('overview'); setSelectedDealId(null); }} className={`flex flex-col items-center gap-1 transition ${activeTab === 'overview' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`p-1 rounded-full ${activeTab === 'overview' ? 'bg-brand-50 text-brand-600' : ''}`}><LayoutGrid className="w-5 h-5" /></div><span className="text-[10px]">Overview</span>
        </button>
        <button onClick={() => { setDealFilter('all'); setActiveTab('deals'); setSelectedDealId(null); }} className={`flex flex-col items-center gap-1 transition ${activeTab === 'deals' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`p-1 rounded-full ${activeTab === 'deals' ? 'bg-brand-50 text-brand-600' : ''}`}><Ship className="w-5 h-5" /></div><span className="text-[10px]">Deals</span>
        </button>
        <button onClick={() => { setQueueStatusFilter('all'); setActiveTab('queue'); setSelectedDealId(null); }} className={`flex flex-col items-center gap-1 transition ${activeTab === 'queue' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`p-1 rounded-full ${activeTab === 'queue' ? 'bg-brand-50 text-brand-600' : ''}`}><CheckSquare className="w-5 h-5" /></div><span className="text-[10px]">Queue</span>
        </button>
      </div>
    </div>
  );
}