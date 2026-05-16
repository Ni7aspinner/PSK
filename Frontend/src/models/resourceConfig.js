export const resourceConfig = {
  suppliers: {
    title: 'Suppliers',
    singular: 'supplier',
    primaryField: 'name',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'registrationCode', label: 'Registration code', createOnly: true, required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'registrationCode', label: 'Registration Code' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
    ],
  },
  contracts: {
    title: 'Contracts',
    singular: 'contract',
    primaryField: 'contractNumber',
    fields: [
      { name: 'contractNumber', label: 'Contract number', createOnly: true, required: true },
      { name: 'title', label: 'Title', required: true },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'EXPIRED', 'TERMINATED'], required: true },
      { name: 'supplierId', label: 'Supplier', type: 'resourceSelect', resourceTarget: 'suppliers', createOnly: true, required: true },
    ],
    columns: [
      { key: 'contractNumber', label: 'Contract Number' },
      { key: 'title', label: 'Title' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'status', label: 'Status' },
      { key: 'servicesCount', label: 'Linked Services' },
    ],
  },
  services: {
    title: 'Services',
    singular: 'service',
    primaryField: 'name',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description' },
      { name: 'active', label: 'Active', type: 'select', options: ['true', 'false'], required: true },
      { name: 'supplierId', label: 'Supplier', type: 'resourceSelect', resourceTarget: 'suppliers', required: true },
      { name: 'contractId', label: 'Contract', type: 'resourceSelect', resourceTarget: 'contracts' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'contractTitle', label: 'Contract' },
      { key: 'activeLabel', label: 'Status' },
    ],
  },
}

export const navItems = [
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'services', label: 'Services' },
]
