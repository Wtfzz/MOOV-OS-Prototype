import * as XLSX from 'xlsx';
import type { Client } from '@/types';

/**
 * 将客户数据导出为 Excel 文件
 */
export function exportClientsToExcel(clients: Client[], fileName: string = 'clients') {
  // 准备导出数据 - 按照表格显示的格式
  const exportData = clients.map(client => ({
    'Client ID': client.clientId,
    'Client Name': client.clientName,
    'Client Code': client.clientCode,
    'Client Type': client.clientType,
    'Country (Operational)': client.operationalCountry || '',
    'Industry / Sector': client.industrySector || '',
    'Status': client.status,
    'Invoice Legal Entity': client.invoiceLegalEntity,
    'Invoice Currency': client.invoiceCurrency,
    'Payment Terms': client.paymentTerms || '',
    'Tax Registration Number': client.taxRegistrationNumber || '',
    'Billing Address': client.billingAddress || '',
    'Invoice Format': client.invoiceFormat || '',
    'Credit Limit': client.creditLimit ?? '',
    'Discount Profile': client.discountProfile || '',
    'Address Line 1': client.address?.addressLine1 || '',
    'Address Line 2': client.address?.addressLine2 || '',
    'City': client.address?.city || '',
    'State/Province': client.address?.stateProvince || '',
    'Country (Address)': client.address?.country || '',
    'Contact Person': client.contactPerson || '',
    'Contact Email': client.contactEmail || '',
    'Contact Phone': client.contactPhone || '',
    'Timezone': client.timezone || '',
    'Active': client.active ? 'Yes' : 'No',
    'Notes': client.notes || '',
  }));

  // 创建工作簿和工作表
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

  // 设置列宽
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 18 },
    { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 24 }, { wch: 40 },
    { wch: 24 }, { wch: 16 }, { wch: 24 }, { wch: 32 }, { wch: 32 }, { wch: 20 },
    { wch: 20 }, { wch: 16 }, { wch: 24 }, { wch: 30 }, { wch: 20 }, { wch: 24 },
    { wch: 10 }, { wch: 40 },
  ];

  // 生成 Excel 文件并下载
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
