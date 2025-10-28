'use client';

import { useState } from 'react';
import { 
  DownloadOutlined, 
  FilterOutlined, 
  BarChartOutlined, 
  PieChartOutlined,
  LineChartOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import styles from './Reports.module.css';

interface ReportData {
  id: string;
  title: string;
  type: 'shareholders' | 'meetings' | 'voting' | 'financial';
  description: string;
  generatedDate: string;
  fileSize: string;
  status: 'completed' | 'processing' | 'failed';
}

interface ChartData {
  month: string;
  shareholders: number;
  meetings: number;
  votings: number;
}

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'all', label: 'Tất cả', icon: <BarChartOutlined /> },
    { id: 'shareholders', label: 'Cổ đông', icon: <TeamOutlined /> },
    { id: 'meetings', label: 'Cuộc họp', icon: <CalendarOutlined /> },
    { id: 'voting', label: 'Bầu cử', icon: <CheckSquareOutlined /> },
    { id: 'financial', label: 'Tài chính', icon: <LineChartOutlined /> },
  ];

  const reports: ReportData[] = [
    {
      id: '1',
      title: 'Báo cáo Cổ đông Quý I/2024',
      type: 'shareholders',
      description: 'Thống kê tình hình cổ đông và biến động cổ phần',
      generatedDate: '2024-04-01',
      fileSize: '2.4 MB',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Báo cáo Cuộc họp Năm 2023',
      type: 'meetings',
      description: 'Tổng hợp các cuộc họp ĐHCĐ và HĐQT',
      generatedDate: '2024-01-15',
      fileSize: '1.8 MB',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Kết quả Bầu cử HĐQT 2024',
      type: 'voting',
      description: 'Kết quả bầu cử Hội đồng quản trị nhiệm kỳ mới',
      generatedDate: '2024-03-20',
      fileSize: '3.1 MB',
      status: 'completed'
    },
    {
      id: '4',
      title: 'Báo cáo Tài chính Quý IV/2023',
      type: 'financial',
      description: 'Báo cáo tài chính đã kiểm toán năm 2023',
      generatedDate: '2024-02-10',
      fileSize: '4.2 MB',
      status: 'completed'
    },
    {
      id: '5',
      title: 'Báo cáo Cổ đông Thường niên',
      type: 'shareholders',
      description: 'Đang xử lý...',
      generatedDate: '2024-05-01',
      fileSize: '--',
      status: 'processing'
    }
  ];

  const chartData: ChartData[] = [
    { month: 'Tháng 1', shareholders: 120, meetings: 2, votings: 1 },
    { month: 'Tháng 2', shareholders: 135, meetings: 1, votings: 0 },
    { month: 'Tháng 3', shareholders: 142, meetings: 3, votings: 2 },
    { month: 'Tháng 4', shareholders: 156, meetings: 2, votings: 1 },
    { month: 'Tháng 5', shareholders: 148, meetings: 1, votings: 1 },
    { month: 'Tháng 6', shareholders: 165, meetings: 4, votings: 3 },
  ];

  const stats = {
    totalReports: reports.length,
    completedReports: reports.filter(r => r.status === 'completed').length,
    totalFileSize: '11.5 MB',
    averageGenerationTime: '2.3 phút'
  };

  const filteredReports = selectedReportType === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedReportType);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // Add new report to list
      const newReport: ReportData = {
        id: Date.now().toString(),
        title: `Báo cáo ${new Date().toLocaleDateString('vi-VN')}`,
        type: selectedReportType as any,
        description: 'Báo cáo mới được tạo tự động',
        generatedDate: new Date().toISOString().split('T')[0],
        fileSize: '1.5 MB',
        status: 'completed'
      };
      // In a real app, you would update the state here
      console.log('Generated report:', newReport);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className={styles.statusCompleted}>Hoàn thành</div>;
      case 'processing':
        return <div className={styles.statusProcessing}>Đang xử lý</div>;
      case 'failed':
        return <div className={styles.statusFailed}>Thất bại</div>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shareholders':
        return <TeamOutlined className={styles.shareholdersIcon} />;
      case 'meetings':
        return <CalendarOutlined className={styles.meetingsIcon} />;
      case 'voting':
        return <CheckSquareOutlined className={styles.votingIcon} />;
      case 'financial':
        return <LineChartOutlined className={styles.financialIcon} />;
      default:
        return <BarChartOutlined />;
    }
  };

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1>Báo cáo & Thống kê</h1>
          <p>Quản lý và tạo báo cáo hệ thống</p>
        </div>
        <button 
          className={styles.generateButton}
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          <DownloadOutlined />
          {isGenerating ? 'Đang tạo...' : 'Tạo báo cáo'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BarChartOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalReports}</h3>
            <p>Tổng số báo cáo</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckSquareOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.completedReports}</h3>
            <p>Đã hoàn thành</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FilePdfOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalFileSize}</h3>
            <p>Tổng dung lượng</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CalendarOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.averageGenerationTime}</h3>
            <p>Thời gian TB</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Loại báo cáo</label>
            <div className={styles.reportTypes}>
              {reportTypes.map(type => (
                <button
                  key={type.id}
                  className={`${styles.typeButton} ${
                    selectedReportType === type.id ? styles.active : ''
                  }`}
                  onClick={() => setSelectedReportType(type.id)}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Khoảng thời gian</label>
            <div className={styles.dateRange}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                placeholder="Từ ngày"
              />
              <span>đến</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                placeholder="Đến ngày"
              />
              <button className={styles.filterButton}>
                <FilterOutlined />
                Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className={styles.reportsSection}>
          <div className={styles.sectionHeader}>
            <h2>Báo cáo đã tạo</h2>
            <div className={styles.exportButtons}>
              <button className={styles.exportButton}>
                <FilePdfOutlined />
                PDF
              </button>
              <button className={styles.exportButton}>
                <FileExcelOutlined />
                Excel
              </button>
            </div>
          </div>

          <div className={styles.reportsList}>
            {filteredReports.map(report => (
              <div key={report.id} className={styles.reportCard}>
                <div className={styles.reportHeader}>
                  <div className={styles.reportType}>
                    {getTypeIcon(report.type)}
                    <span className={styles.typeLabel}>
                      {reportTypes.find(t => t.id === report.type)?.label}
                    </span>
                  </div>
                  {getStatusIcon(report.status)}
                </div>
                
                <h3 className={styles.reportTitle}>{report.title}</h3>
                <p className={styles.reportDescription}>{report.description}</p>
                
                <div className={styles.reportMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Ngày tạo:</span>
                    <span>{new Date(report.generatedDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Kích thước:</span>
                    <span>{report.fileSize}</span>
                  </div>
                </div>

                <div className={styles.reportActions}>
                  <button className={styles.viewButton}>
                    <EyeOutlined />
                    Xem
                  </button>
                  <button 
                    className={styles.downloadButton}
                    disabled={report.status !== 'completed'}
                  >
                    <DownloadOutlined />
                    Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          <h2>Thống kê hoạt động</h2>
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h4>Hoạt động theo tháng</h4>
              <div className={styles.chart}>
                {chartData.map((data, index) => (
                  <div key={data.month} className={styles.chartBar}>
                    <div className={styles.barLabel}>{data.month}</div>
                    <div className={styles.bars}>
                      <div 
                        className={styles.barShareholders}
                        style={{ height: `${data.shareholders / 2}px` }}
                        title={`Cổ đông: ${data.shareholders}`}
                      ></div>
                      <div 
                        className={styles.barMeetings}
                        style={{ height: `${data.meetings * 20}px` }}
                        title={`Cuộc họp: ${data.meetings}`}
                      ></div>
                      <div 
                        className={styles.barVotings}
                        style={{ height: `${data.votings * 30}px` }}
                        title={`Bầu cử: ${data.votings}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
                <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.shareholders}`}></div>
                    <span>Cổ đông</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.meetings}`}></div>
                    <span>Cuộc họp</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendColor} ${styles.votings}`}></div>
                    <span>Bầu cử</span>
                </div>
                </div>
            </div>

            <div className={styles.chartCard}>
              <h4>Phân loại báo cáo</h4>
              <div className={styles.pieChart}>
                <div className={styles.pieSlice} style={{ '--percentage': '40%', '--color': '#3498db' } as React.CSSProperties}>
                  <span>Cổ đông</span>
                </div>
                <div className={styles.pieSlice} style={{ '--percentage': '25%', '--color': '#e74c3c' } as React.CSSProperties}>
                  <span>Cuộc họp</span>
                </div>
                <div className={styles.pieSlice} style={{ '--percentage': '20%', '--color': '#2ecc71' } as React.CSSProperties}>
                  <span>Bầu cử</span>
                </div>
                <div className={styles.pieSlice} style={{ '--percentage': '15%', '--color': '#f39c12' } as React.CSSProperties}>
                  <span>Tài chính</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}