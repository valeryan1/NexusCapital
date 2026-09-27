import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, Building2, Newspaper, TrendingDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock Data
const sectorData = {
  id: 'banks',
  name: 'Banks',
  summary: {
    marketCap: 'IDR 2,335.6T',
    peRatio: 8.93,
    peHistorical: 12.94,
    ytdPerformance: -21.23,
    dividendYield: 4.94,
    oneYearPerformance: -19.08,
  },
  healthScore: 7.4,
  growthScore: 5.9,
  topCompanies: [
    { ticker: 'BMRI', name: 'PT Bank Mandiri (Persero) Tbk', profit: 69.99, revenue: 150.2, marketCap: 800.5, growth: 12.4 },
    { ticker: 'BBRI', name: 'PT Bank Rakyat Indonesia (Persero) Tbk', profit: 62.32, revenue: 140.8, marketCap: 750.2, growth: 10.1 },
    { ticker: 'BBCA', name: 'PT Bank Central Asia Tbk', profit: 58.12, revenue: 130.5, marketCap: 1100.8, growth: 15.2 },
    { ticker: 'BBNI', name: 'PT Bank Negara Indonesia (Persero) Tbk', profit: 20.81, revenue: 80.4, marketCap: 300.4, growth: 8.5 },
    { ticker: 'BRIS', name: 'PT Bank Syariah Indonesia Tbk', profit: 7.98, revenue: 30.2, marketCap: 150.1, growth: 22.1 },
  ],
  news: [
    { title: 'BBCA and AMRT lead foreign net buying as IHSG falls on Friday', date: 'Sep 26, 2026', sentiment: 'bullish' },
    { title: 'PT Bank Aladin Syariah Tbk strengthens its Islamic digital ecosystem', date: 'Sep 25, 2026', sentiment: 'bullish' },
    { title: 'Bank Central Asia stock again draws investor focus', date: 'Sep 26, 2026', sentiment: 'bullish' },
  ]
}

export const Route = createFileRoute('/_protected/sectors/$sectorId')({
  component: SectorDashboard,
})

function SectorDashboard() {
  // In a real app, we'd fetch data based on sectorId. Using mock for now.
  const data = sectorData

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-dark-800 pb-6 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3 tracking-wide">
            <span className="hover:text-white cursor-pointer transition-colors">Sectors</span>
            <span>/</span>
            <span className="hover:text-white cursor-pointer transition-colors">Indonesia</span>
            <span>/</span>
            <span className="hover:text-white cursor-pointer transition-colors">Financials</span>
            <span>/</span>
            <span className="font-semibold text-brand-500">{data.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            Sector: <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-400">{data.name}</span>
          </h1>
          <p className="text-gray-400 max-w-3xl leading-relaxed text-sm md:text-base">
            The {data.name} sector encompasses a wide range of financial institutions. It appears to be experiencing market fluctuations with a bearish sentiment recently. Notable companies include BBCA, BBRI, and BMRI.
          </p>
        </div>
        
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto border-dark-700 bg-dark-900/50 hover:bg-dark-800 text-white">
            <Download className="w-4 h-4 mr-2 text-brand-500" /> Export Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Market Cap" value={data.summary.marketCap} subtitle="21.42% of total IDX" icon={<Building2 className="w-4 h-4" />} />
        <MetricCard 
          title="P/E Benchmark" 
          value={data.summary.peRatio.toString()} 
          subtitle={`Hist. Avg: ${data.summary.peHistorical}`} 
          trend={data.summary.peRatio < data.summary.peHistorical ? 'positive' : 'negative'}
          icon={<Activity className="w-4 h-4" />} 
        />
        <MetricCard 
          title="YTD Performance" 
          value={`${data.summary.ytdPerformance}%`} 
          trend="negative"
          icon={<TrendingDown className="w-4 h-4" />} 
        />
        <MetricCard title="Dividend Yield" value={`${data.summary.dividendYield}%`} subtitle="Beats IDX avg 3.07%" icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {/* Health & Growth Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-dark-900/40 backdrop-blur-md border-dark-800 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="relative z-10 border-b border-dark-800/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white font-medium">
              <div className="p-1.5 bg-emerald-500/10 rounded-md">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              Resilience & Health Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6 relative z-10">
            <div className="flex justify-between items-end">
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-white">{data.healthScore}</span>
                <span className="text-gray-500 font-medium ml-1">/ 10</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1 uppercase tracking-wider text-[10px] font-bold">Moderately Resilient</Badge>
            </div>
            <div className="space-y-2">
              <Progress value={data.healthScore * 10} className="h-2.5 bg-dark-800 [&>div]:bg-emerald-500" />
              <p className="text-xs text-gray-400">The Banks sector is considered healthy relative to other sectors on IDX.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/40 backdrop-blur-md border-dark-800 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="relative z-10 border-b border-dark-800/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-white font-medium">
              <div className="p-1.5 bg-blue-500/10 rounded-md">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              Sector Growth Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6 relative z-10">
            <div className="flex justify-between items-end">
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-white">{data.growthScore}</span>
                <span className="text-gray-500 font-medium ml-1">/ 10</span>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 px-3 py-1 uppercase tracking-wider text-[10px] font-bold">Predictable Growth</Badge>
            </div>
            <div className="space-y-2">
              <Progress value={data.growthScore * 10} className="h-2.5 bg-dark-800 [&>div]:bg-blue-500" />
              <p className="text-xs text-gray-400">Steady and predictable growth largely in line with expectations.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Companies Leaderboard */}
        <Card className="lg:col-span-2 bg-dark-900/40 backdrop-blur-md border-dark-800 overflow-hidden">
          <CardHeader className="border-b border-dark-800/50 bg-dark-900/20">
            <CardTitle className="flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5 text-brand-500" /> Top Companies Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="profit" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-dark-800/50 p-1 rounded-lg">
                <TabsTrigger value="marketCap" className="rounded-md data-[state=active]:bg-brand-500 data-[state=active]:text-white">Market Cap</TabsTrigger>
                <TabsTrigger value="revenue" className="rounded-md data-[state=active]:bg-brand-500 data-[state=active]:text-white">Revenue</TabsTrigger>
                <TabsTrigger value="profit" className="rounded-md data-[state=active]:bg-brand-500 data-[state=active]:text-white">Profit</TabsTrigger>
                <TabsTrigger value="growth" className="rounded-md data-[state=active]:bg-brand-500 data-[state=active]:text-white">Growth</TabsTrigger>
              </TabsList>
              
              {['profit', 'revenue', 'marketCap', 'growth'].map((metric) => {
                const maxVal = Math.max(...data.topCompanies.map(c => c[metric as keyof typeof c] as number))
                return (
                  <TabsContent key={metric} value={metric} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-3 px-2">
                      <span>Company Ticker</span>
                      <span>{metric} {metric !== 'growth' ? '(Trillion IDR)' : '(%)'}</span>
                    </div>
                    <div className="space-y-3">
                      {data.topCompanies
                        .sort((a, b) => (b[metric as keyof typeof b] as number) - (a[metric as keyof typeof a] as number))
                        .map((company) => (
                        <div key={company.ticker} className="flex items-center justify-between gap-4 group hover:bg-dark-800/30 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-dark-700">
                          <div className="w-20 shrink-0 font-bold text-white group-hover:text-brand-400 transition-colors">{company.ticker}</div>
                          <div className="flex-1 h-8 bg-dark-800/50 rounded-md overflow-hidden flex items-center">
                            <div 
                              className="h-full bg-gradient-to-r from-brand-600/40 to-brand-500/80 group-hover:from-brand-500/60 group-hover:to-brand-400/90 transition-all flex items-center relative"
                              style={{ width: `${((company[metric as keyof typeof company] as number) / maxVal) * 100}%` }}
                            >
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          </div>
                          <div className="w-16 text-right font-medium text-gray-300 group-hover:text-white">
                            {company[metric as keyof typeof company]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Sector News */}
        <Card className="bg-dark-900/40 backdrop-blur-md border-dark-800 overflow-hidden">
          <CardHeader className="border-b border-dark-800/50 bg-dark-900/20">
            <CardTitle className="flex items-center gap-2 text-white">
              <Newspaper className="w-5 h-5 text-brand-500" /> Recent Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {data.news.map((newsItem, i) => (
              <div key={i} className="p-5 border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <span>{newsItem.date}</span>
                  <Badge variant="secondary" className="bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 border-[#22c55e]/20">{newsItem.sentiment}</Badge>
                </div>
                <h4 className="font-medium text-sm text-gray-300 leading-snug group-hover:text-brand-400 transition-colors">{newsItem.title}</h4>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, trend, icon }: { title: string, value: string, subtitle?: string, trend?: 'positive' | 'negative', icon: React.ReactNode }) {
  return (
    <Card className="bg-dark-900/40 backdrop-blur-md border-dark-800 hover:border-dark-700 transition-colors group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-400 transition-colors">{title}</CardTitle>
        <div className="text-dark-400 bg-dark-800 p-1.5 rounded-md group-hover:text-brand-500 group-hover:bg-brand-500/10 transition-colors">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-white flex items-center gap-2 tracking-tight">
          {value}
          {trend === 'positive' && <ArrowUpRight className="w-5 h-5 text-[#22c55e]" />}
          {trend === 'negative' && <ArrowDownRight className="w-5 h-5 text-[#f43f5e]" />}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
