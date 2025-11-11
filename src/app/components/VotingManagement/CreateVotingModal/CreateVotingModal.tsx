'use client';
import { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import styles from './CreateVotingModal.module.css';

interface CreateVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (votingData: any) => void;
}

export default function CreateVotingModal({ isOpen, onClose, onCreate }: CreateVotingModalProps) {
  const [formData, setFormData] = useState({
    votingCode: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    options: ['']
  });

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const votingData = {
      ...formData,
      options: formData.options.filter(opt => opt.trim() !== '').map((opt, index) => ({
        id: `opt-${index}`,
        name: opt.trim()
      }))
    };
    
    onCreate(votingData);
    setFormData({
      votingCode: '',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      options: ['']
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Tạo Biểu quyết Mới</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Mã biểu quyết *</label>
              <input
                type="text"
                value={formData.votingCode}
                onChange={(e) => setFormData(prev => ({ ...prev, votingCode: e.target.value }))}
                placeholder="VD: BQ-2024-001"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tiêu đề biểu quyết *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề biểu quyết"
                required
              />
            </div>

            <div className={styles.formGroupFull}>
              <label>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả về cuộc biểu quyết..."
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ngày bắt đầu *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ngày kết thúc *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroupFull}>
              <div className={styles.optionsHeader}>
                <label>Lựa chọn biểu quyết *</label>
                <button type="button" onClick={handleAddOption} className={styles.addOptionButton}>
                  + Thêm lựa chọn
                </button>
              </div>
              
              <div className={styles.optionsList}>
                {formData.options.map((option, index) => (
                  <div key={index} className={styles.optionItem}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Lựa chọn ${index + 1}`}
                      className={styles.optionInput}
                    />
                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className={styles.removeOptionButton}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Hủy
            </button>
            <button type="submit" className={styles.createButton}>
              Tạo Biểu quyết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}