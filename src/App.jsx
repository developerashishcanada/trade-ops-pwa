import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  Ship, 
  CheckSquare, 
  BookOpen, 
  Plus, 
  X, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  ChevronRight, 
  CheckCircle2,
  Bell
} from 'lucide-react';

// Standard 12-Step Playbook Definition
const INITIAL_RULES = [
  { id: 1, name: 'Deal Closure', offset: 7, email: 'sales@company.com' },
  { id: 2, name: 'Loading', offset: 14, email: 'satya223@gmail.com' },
  { id: 3, name: 'PSIC', offset: 21, email: 'docs@company.com' },
  { id: 4, name: 'Loaded to Ship', offset: 28, email: 'ops@company.com' },
  { id: 5, name: 'Draft Bill of Lading (BL)', offset: 35, email: 'docs@company.com' },
  { id: 6, name: 'High Seas Contract', offset: 42, email: 'legal@company.com' },
  { id: 7, name: 'Port Change (If Needed)', offset: 49, email: 'ops@company.com' },
  { id: 8, name: 'Telex Release / Final BL', offset: 56, email: 'docs@company.com' },
  { id: 9, name: 'Custom Clearance', offset: 63, email: 'satya223@gmail.com' },
  { id: 10, name: 'Make Invoice', offset: 70, email: 'finance@company.com' },
  { id: 11, name: 'Receive Buyer Payment', offset: 77, email: 'finance@company.com' },
  { id: 12, name: 'Pay Supplier (Close Deal)', offset: 84, email: 'finance@company.com' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, deals, queue, playbook
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [queueScope, setQueueScope] = useState('all'); // all, my
  const currentUserEmail = 'developerashish.canada@gmail.com';

  // Seed Deals Data
  const [deals, setDeDeals] = useState([
    {
      id: '101',
      buyer: 'Chandan steel',
      supplier: 'Cronitex',
      shipmentDate: '2026-09-01',
      destinationDate: '2026-09-20',
      highSeas: 'No',
      status: 'In flight'
    },
    {
      id: '102',
      buyer: 'xyz',
      supplier: 'abc',
      shipmentDate: '2026-09-14',
      destinationDate: '2026-09-16',
      highSeas: 'No',
      status: 'No steps'
    },
    {
      id: '103',
      buyer: 'jindal',
      supplier: 'cronitex',
      shipmentDate: '2026-10-02',
      destinationDate: '2026-10-25',
      highSeas: 'No',
      status: 'No steps'
    },
    {
      id: '104',
      buyer: 'res',
      supplier: 'sup',
      shipmentDate: '2026-10-01',
      destinationDate: '2026-12-01',
      highSeas: 'Yes',
      status: 'In flight'
    }
  ]);

  // Seed Steps
  const [steps, setSteps] = useState([
    ...INITIAL_RULES.map((rule, idx) => ({
      id: `101-${rule.id}`,
      dealId: '101',
      buyer: 'Chandan steel',
      stepNumber: rule.id,
      name: rule.name,
      assignedEmail: rule.email,
      dueDate: new Date(2026, 7, 22 + idx * 3).toISOString().split('T')[0],
      status: 'Pending',
      actualDate: '',
      docRef: ''
    }))
  ]);

  // Form State
  const [formData, setFormData] = useState({
    id: 'AV-2026-110',
    buyer: '',
    supplier: '',
    shipmentDate: '',
    destinationDate: '',
    highSeas: 'No'
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const liveDeals = deals.length;
    const highSeas = deals.filter(d => d.highSeas === 'Yes').length;
    const delayedSteps = steps.filter(s => s.status === 'Overdue').length;
    const pendingSteps = steps.filter(s => s.status === 'Pending').length;
    return { liveDeals, highSeas, delayedSteps, pendingSteps };
  }, [deals, steps]);

  // Deal Creation Flow
  const handleCreateDeal = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.buyer || !formData.shipmentDate) return;

    const newDeal = {
      id: formData.id,
      buyer: formData.buyer,
      supplier: formData.supplier || 'Unassigned',
      shipmentDate: formData.shipmentDate,
      destinationDate: formData.destinationDate,
      highSeas: formData.highSeas,
      status: 'In flight'
    };

    // Auto-generate the 12 steps based on Playbook rules
    const newSteps = INITIAL_RULES.map((rule) => {
      const baseDate = new Date(formData.shipmentDate);
      baseDate.setDate(baseDate.getDate() + rule.offset);
      return {
        id: `${formData.id}-${rule.id}`,
        dealId: formData.id,
        buyer: formData.buyer,
        stepNumber: rule.id,
        name: rule.name,
        assignedEmail: rule.email,
        dueDate: baseDate.toISOString().split('T')[0],
        status: 'Pending',
        actualDate: '',
        docRef: ''
      };
    });

    setDeDeals([newDeal, ...deals]);
    setSteps([...steps, ...newSteps]);
    setShowAddModal(false);
    setFormData({
      id: `AV-2026-${Math.floor(100 + Math.random() * 900)}`,
      buyer: '',
      supplier: '',
      shipmentDate: '',
      destinationDate: '',
      highSeas: 'No'
    });
  };

  const selectedDeal = deals.find(d => d.id === selectedDealId);
  const selectedDealSteps = steps.filter(s => s.dealId === selectedDealId);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-24 border-x border-slate-100 flex flex-col justify-between select-none">
      <div className="p-4 flex-1">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && !selectedDealId && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trade Operations Console</h1>
              <button 
                onClick={() => setActiveTab('deals')}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <span>&rarr;</span> Open deals
              </button>
            </div>

            {/* 2x2 Metric Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                <p className="text-xs font-medium text-slate-500">Live deals</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.liveDeals}</p>
                <p className="text-[11px] text-slate-400">Across active routes</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                <p className="text-xs font-medium text-slate-500">High seas</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.highSeas}</p>
                <p className="text-[11px] text-slate-400">Require close watch</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                <p className="text-xs font-medium text-slate-500">Delayed steps</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.delayedSteps}</p>
                <p className="text-[11px] text-slate-400">No delay flags</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                <p className="text-xs font-medium text-slate-500">Pending steps</p>
                <p className="text-2xl font-bold text-slate-900 my-0.5">{metrics.pendingSteps}</p>
                <p className="text-[11px] text-slate-400">Awaiting operator update</p>
              </div>
            </div>

            {/* Attention Queue */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-900">Attention queue</h2>
              <button 
                onClick={() => setActiveTab('queue')}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Open queue
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {steps.slice(0, 7).map((step) => (
                <div key={step.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{step.name} &middot; {step.dealId}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{step.assignedEmail} &middot; Due {step.dueDate}</p>
                    </div>
                  </div>
                  <span className="bg-amber-100/70 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DEALS LIST OR DEAL TIMELINE */}
        {activeTab === 'deals' && !selectedDealId && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl font-bold text-slate-900">Deals</h1>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> New deal
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-slate-700 block mb-1">Deal filter</label>
              <select className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option>All deals</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-2">Rows open the full deal timeline.</p>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {deals.map((deal) => (
                <div 
                  key={deal.id} 
                  onClick={() => setSelectedDealId(deal.id)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Ship className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{deal.id} &middot; {deal.buyer}</p>
                      <p className="text-[11px] text-slate-500">{deal.supplier} &middot; Ship {deal.shipmentDate} &middot; ETA {deal.destinationDate}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    deal.status === 'In flight' ? 'bg-amber-100/70 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {deal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEAL DETAILS VIEW */}
        {selectedDealId && selectedDeal && (
          <div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
              <span className="cursor-pointer hover:underline" onClick={() => setSelectedDealId(null)}>Deals</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>{selectedDeal.id}</span>
            </div>

            <h1 className="text-lg font-bold text-slate-900 mb-3">{selectedDeal.id} &middot; {selectedDeal.buyer}</h1>

            {/* Deal Summary Box */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white mb-5 shadow-sm">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Supplier</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDeal.supplier}</p>
                </div>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                  Standard route
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 text-[11px]">Shipment date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedDeal.shipmentDate}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Destination date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedDeal.destinationDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                <div>
                  <p className="text-slate-400 text-[11px]">Progress</p>
                  <p className="font-bold text-slate-900 mt-0.5">0%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Delayed steps</p>
                  <p className="font-bold text-slate-900 mt-0.5">0</p>
                </div>
              </div>
            </div>

            {/* Steps Timeline Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-900">Lifecycle steps</h2>
              <span className="text-xs text-slate-400">{selectedDealSteps.length} steps</span>
            </div>

            {/* Steps Timeline List */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {selectedDealSteps.map((step) => (
                <div key={step.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{step.name}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{step.assignedEmail} &middot; Due {step.dueDate}</p>
                    </div>
                  </div>
                  <span className="bg-amber-100/70 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MY QUEUE */}
        {activeTab === 'queue' && (
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-3">My Queue</h1>

            <div className="mb-4">
              <label className="text-xs font-medium text-slate-700 block mb-1">Queue scope</label>
              <select 
                value={queueScope}
                onChange={(e) => setQueueScope(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All team steps</option>
                <option value="my">My assigned steps</option>
              </select>
              {queueScope === 'all' && (
                <p className="text-[11px] text-slate-400 mt-2">Team-wide operator queue</p>
              )}
              {queueScope === 'my' && (
                <p className="text-[11px] text-slate-400 mt-2 truncate">{currentUserEmail}</p>
              )}
            </div>

            {queueScope === 'all' ? (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {steps.map((step) => (
                  <div key={step.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">{step.name} &middot; {step.dealId}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{step.buyer} &middot; Due {step.dueDate}</p>
                      </div>
                    </div>
                    <span className="bg-amber-100/70 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-8 text-center bg-white mt-4">
                <CheckCircle2 className="w-9 h-9 text-slate-400 mx-auto mb-2.5 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-800">No steps assigned to you</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                  Your assigned milestones will appear here once they are allocated.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PLAYBOOK / RULES */}
        {activeTab === 'playbook' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Rules &amp; Automation</h1>
              <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition">
                <Plus className="w-3.5 h-3.5" /> Add rule
              </button>
            </div>

            {/* Reminder Info Box */}
            <div className="border border-slate-200 rounded-xl p-3.5 mb-5 bg-white">
              <div className="flex items-center gap-2 mb-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-xs font-bold text-slate-900">Reminder behavior</p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Admin reminders use the email recorded on each assigned step. New deals receive every active rule below with a deadline calculated from the shipment date.
              </p>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold text-slate-900">Standard step rules</h2>
              <span className="text-[11px] text-slate-400">{INITIAL_RULES.length} rules</span>
            </div>

            {/* Rules Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-left bg-white">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Step</th>
                    <th className="py-2.5 px-3">Deadline rule</th>
                    <th className="py-2.5 px-3 text-right">Reminder email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_RULES.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{rule.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">ShipmentDate +{rule.offset}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500 truncate max-w-[100px]">{rule.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SHEET MODAL: ADD NEW DEAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-end justify-center backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
            
            <div className="flex justify-between items-center mb-1">
              <div className="w-full text-center">
                <h2 className="text-sm font-bold text-slate-900">Add a new deal</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Saving a deal creates the standard lifecycle steps from the playbook.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 absolute right-4 top-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deal ID</label>
                <input 
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Buyer</label>
                <input 
                  type="text"
                  placeholder="Buyer desk"
                  value={formData.buyer}
                  onChange={(e) => setFormData({...formData, buyer: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier</label>
                <input 
                  type="text"
                  placeholder="Supplier desk"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shipment date</label>
                <input 
                  type="date"
                  value={formData.shipmentDate}
                  onChange={(e) => setFormData({...formData, shipmentDate: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destination date</label>
                <input 
                  type="date"
                  value={formData.destinationDate}
                  onChange={(e) => setFormData({...formData, destinationDate: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">High-seas handling</label>
                <select 
                  value={formData.highSeas}
                  onChange={(e) => setFormData({...formData, highSeas: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button 
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm"
                >
                  + Create deal
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-sm border-t border-slate-200 px-6 py-2 flex justify-between items-center z-40">
        <button 
          onClick={() => { setActiveTab('overview'); setSelectedDealId(null); }}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'overview' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'overview' ? 'bg-brand-50 text-brand-600' : ''}`}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Overview</span>
        </button>

        <button 
          onClick={() => { setActiveTab('deals'); setSelectedDealId(null); }}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'deals' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'deals' ? 'bg-brand-50 text-brand-600' : ''}`}>
            <Ship className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Deals</span>
        </button>

        <button 
          onClick={() => { setActiveTab('queue'); setSelectedDealId(null); }}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'queue' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'queue' ? 'bg-brand-50 text-brand-600' : ''}`}>
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px]">My queue</span>
        </button>

        <button 
          onClick={() => { setActiveTab('playbook'); setSelectedDealId(null); }}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'playbook' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'playbook' ? 'bg-brand-50 text-brand-600' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Playbook</span>
        </button>
      </div>
    </div>
  );
}