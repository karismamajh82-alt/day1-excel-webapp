import React, { useRef, useState } from 'react'

export default function FileUpload({ onFileUpload, isLoading, error }) {
  const inputRef  = useRef(null)
  const [isDrag, setIsDrag] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDrag(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.xlsx')) onFileUpload(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFileUpload(file)
    e.target.value = ''
  }

  return (
    <div className="upload-page">
      <div className="upload-inner">

        {/* Logo / heading */}
        <div className="upload-header">
          <div className="upload-logo-bolt">◆</div>
          <h1 className="upload-title">
            Excel <span className="accent">Dashboard</span>
          </h1>
          <p className="upload-subtitle">
            .xlsx 파일을 업로드하면 핵심 지표와 차트를<br />자동으로 생성해 드립니다
          </p>
        </div>

        {/* Drop zone */}
        <div
          className={`dropzone${isDrag ? ' is-drag' : ''}${isLoading ? ' is-loading' : ''}`}
          onClick={() => !isLoading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true) }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          {isLoading ? (
            <div className="dropzone-loading">
              <div className="spinner" />
              <span>파일을 읽는 중입니다...</span>
            </div>
          ) : (
            <>
              <span className="dropzone-icon">📊</span>
              <p className="dropzone-main">
                {isDrag ? '파일을 놓으세요' : '.xlsx 파일을 드래그하거나 클릭하여 업로드'}
              </p>
              <p className="dropzone-hint">EXCEL 2007+ (.xlsx) 형식만 지원합니다</p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="upload-error">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Feature cards */}
        <div className="feature-grid">
          {[
            ['◆', '핵심 지표 카드',   '총 매출·이익·이익률 자동 계산'],
            ['◆', '지역별 매출 차트', '지역·국가별 매출 비교'],
            ['◆', '분기별 추이 차트', '기간별 매출 흐름 시각화'],
            ['◆', '법인별 영업이익', '흑자·적자 법인 한눈에 파악'],
            ['◆', '원본 데이터 표',   '전체 데이터 검색·필터·정렬'],
            ['◆', '컬럼 자동 감지',   '한국어·영어 컬럼명 자동 인식'],
          ].map(([icon, title, desc], i) => (
            <div key={i} className="feature-card">
              <p className="feature-card-icon">{icon}</p>
              <p className="feature-card-title">{title}</p>
              <p className="feature-card-desc">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
