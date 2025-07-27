import React from 'react';

interface LinkItem {
  _id: string;
  title: string;
  link?: string;
  file?: string;
  tab: 'Git' | 'Excel' | 'Codebase';
  created_at: string;
  updated_at: string;
}

interface LinkTableProps {
  data: LinkItem[];
  tab: 'Git' | 'Excel' | 'Codebase';
  onEdit: (tab: 'Git' | 'Excel' | 'Codebase', id: string) => void;
  onDelete: (tab: 'Git' | 'Excel' | 'Codebase', id: string) => void;
}

const LinkTable: React.FC<LinkTableProps> = ({ data, tab, onEdit, onDelete }) => {
  // Download handler for file URLs
  const getAbsoluteUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    // Ensure no double slashes
    const base = import.meta.env.VITE_BASE_URL;
    return base + '/' + fileUrl.replace(/^\//, '');
  };

  const handleDownload = (fileUrl: string) => {
    const absUrl = getAbsoluteUrl(fileUrl);
    const link = document.createElement('a');
    link.href = absUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Link
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data && data.length > 0 ? (
            data.map((row) => (
              <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{row.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tab === 'Git' ? (
                    row.link ? (
                      <a 
                        href={row.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        {row.link}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )
                  ) : (
                    row.link ? (
                      <a 
                        href={row.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 underline"
                      >
                        {row.link}
                      </a>
                    ) : row.file ? (
                      typeof row.file === 'string' ? (
                        <div className="flex items-center space-x-2">
                          <a 
                            href={getAbsoluteUrl(row.file)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 underline"
                          >
                            File
                          </a>
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            title="Download"
                            onClick={() => handleDownload(row.file!)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">File</span>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900 font-medium"
                      onClick={() => onEdit(tab, row._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 font-medium"
                      onClick={() => onDelete(tab, row._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <span className="text-4xl mb-4 block">🔗</span>
                  <p className="text-lg font-medium">No links found</p>
                  <p className="text-sm">Add your first {tab.toLowerCase()} link to get started</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LinkTable;
