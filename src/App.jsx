import React, { useState, useMemo, useCallback } from 'react'
import * as XLSX from 'xlsx'
import FileUpload from './components/FileUpload'
import MetricCards from './components/MetricCards'
import DataTable from './components/DataTable'
import RegionalSalesChart from './components/RegionalSalesChart'
import QuarterlySalesChart from './components/QuarterlySalesChart'
import OperatingProfitChart from './components/OperatingProfitChart'
import { processData } from './utils/dataProcessor'

export default function App() {
  const [rawData,    setRawData]    = useState(null)
  const [fileName,   setFileName]   = useState('')
  const [sheetName,  setSheetName]  = useState('')
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState(null)

  const handleFileUpload = useCallback((file) => {
    if (!file) return
    setIsLoading(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data     = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.SheetNames[0]
        const sheet    = workbook.Sheets[firstSheet]
        const json     = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (json.length === 0) {
          setError('시트에 데이터가 없습니다.')
          setIsLoading(false)
          return
        }

        setRawData(json)
        setFileName(file.name)
        setSheetName(firstSheet)
      } catch {
        setError('파일을 읽는 중 오류가 발생했습니다. .xlsx 형식인지 확인해주세요.')
      }
      setIsLoading(false)
    }
    reader.onerror = () => {
      setError('파일을 읽을 수 없습니다.')
      setIsLoading(false)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const processedData = useMemo(() => {
    if (!rawData) return null
    return processData(rawData)
  }, [rawData])

  const handleReset = () => {
    setRawData(null)
    setFileName('')
    setSheetName('')
    setError(null)
  }

  /* ── Loading splash ── */
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-lg" />
        <p>데이터를 분석 중입니다...</p>
      </div>
    )
  }

  /* ── Upload page ── */
  if (!rawData) {
    return (
      <>
        <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
        <footer className="footer">
          <p>파일은 브라우저에서만 처리됩니다 — 외부 서버로 전송되지 않습니다</p>
        </footer>
      </>
    )
  }

  /* ── Dashboard ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-canvas)' }}>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-logo">
              <span className="nav-bolt">◆</span>
              <span className="nav-name">
                Excel <span className="accent">Dashboard</span>
              </span>
            </div>
            <div className="nav-file-badge">
              <span style={{ fontSize: 12 }}>📄</span>
              <span className="nav-file-name">{fileName}</span>
              <span className="nav-sheet-chip">{sheetName}</span>
            </div>
          </div>
          <div className="nav-right">
            <span className="nav-rows">{rawData.length.toLocaleString('ko-KR')} rows</span>
            <button className="btn-new-file" onClick={handleReset}>파일 변경</button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      {processedData && (
        <main className="main">

          {/* ── Metrics ── */}
          <section>
            <div className="section-hd">
              <div className="section-hd-line" />
              <span className="section-hd-label">핵심 지표</span>
              <div className="section-hd-line" />
            </div>
            <MetricCards data={processedData} />
          </section>

          {/* ── Charts ── */}
          <section>
            <div className="section-hd">
              <div className="section-hd-line" />
              <span className="section-hd-label">차트 분석</span>
              <div className="section-hd-line" />
            </div>
            <div className="charts-2col">
              <RegionalSalesChart data={processedData} />
              <QuarterlySalesChart data={processedData} />
            </div>
            <OperatingProfitChart data={processedData} />
          </section>

          {/* ── Table ── */}
          <section>
            <div className="section-hd">
              <div className="section-hd-line" />
              <span className="section-hd-label">원본 데이터</span>
              <div className="section-hd-line" />
            </div>
            <DataTable data={processedData} />
          </section>

        </main>
      )}

      <footer className="footer">
        <p>파일은 브라우저에서만 처리됩니다 — 외부 서버로 전송되지 않습니다</p>
      </footer>
    </div>
  )
}
