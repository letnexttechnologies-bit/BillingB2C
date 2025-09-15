import React, { useState, useEffect } from "react";
import { getInvoices } from "../api/index";
import "./ReportChart.css";
import Receipt from "../components/Receipt";

const ReportChart = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange, setTimeRange] = useState("daily");

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState("month");

  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  // Fetch invoices on mount
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const allInvoices = await getInvoices();
        if (Array.isArray(allInvoices)) {
          setInvoices(allInvoices);
          filterData(
            allInvoices,
            timeRange,
            selectedYear,
            selectedMonth,
            selectedWeek
          );
        } else {
          console.warn("Unexpected invoices response:", allInvoices);
        }
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      }
    };
    fetchInvoices();
  }, []);

  // Helpers
  const filterData = (data = [], range, year, month, week) => {
    let filtered = [];

    switch (range) {
      case "daily":
        filtered = data.filter((inv) => {
          const date = new Date(inv.date);
          return date.toDateString() === selectedDate;
        });
        break;

      case "weekly":
        filtered = data.filter((inv) => {
          const date = new Date(inv.date);
          const weekNumber = getWeekNumber(date);
          return date.getFullYear() === year && weekNumber === week;
        });
        break;

      case "monthly":
        filtered = data.filter((inv) => {
          const date = new Date(inv.date);
          return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
        break;

      case "yearly":
        filtered = data.filter((inv) => {
          const date = new Date(inv.date);
          return date.getFullYear() === year;
        });
        break;

      /* ✅ New Quick Filters */
      case "ThisWeek": {
        const today = new Date();
        const day = today.getDay(); // 0 = Sunday, 6 = Saturday

        // Start from Sunday
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - day);
        weekStart.setHours(0, 0, 0, 0);

        // End on Saturday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        filtered = data.filter((inv) => {
          const date = new Date(inv.date);
          return date >= weekStart && date <= weekEnd;
        });
        break;
      }

      case "thisMonth": {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

        filtered = data.filter((inv) => {
          const date = new Date(inv.date);
          return date >= monthStart && date <= monthEnd;
        });
        break;
      }

      case "thisYear": {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

        filtered = data.filter((inv) => {
          const date = new Date(inv.date);
          return date >= yearStart && date <= yearEnd;
        });
        break;
      }

      default:
        filtered = data;
    }

    setFilteredData(filtered);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.toDateString());
    setTimeRange("daily");
    setShowCalendar(false);
    setShowTransactions(true);
    filterData(invoices, "daily", selectedYear, selectedMonth, selectedWeek);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setShowTransactions(false);
    filterData(invoices, range, selectedYear, selectedMonth, selectedWeek);
  };

  const handleYearChange = (year) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    filterData(invoices, timeRange, newYear, selectedMonth, selectedWeek);
  };

  const handleMonthChange = (month) => {
    const newMonth = parseInt(month);
    setSelectedMonth(newMonth);
    filterData(invoices, timeRange, selectedYear, newMonth, selectedWeek);
  };

  const handleWeekChange = (week) => {
    setSelectedWeek(parseInt(week));
    filterData(
      invoices,
      timeRange,
      selectedYear,
      selectedMonth,
      parseInt(week)
    );
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const closeInvoiceDetails = () => {
    setShowInvoiceDetails(false);
    setSelectedInvoice(null);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Metrics
  const getTotalSales = () =>
    filteredData.reduce((total, inv) => total + (inv.totalAmount || 0), 0);

  const getTransactionCount = () => filteredData.length;

  const getAverageSale = () =>
    filteredData.length > 0 ? getTotalSales() / filteredData.length : 0;

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amt || 0);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Calendar
  const generateMonthCalendar = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendar = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(new Date(year, month - 1, day));
          day++;
        }
      }
      calendar.push(week);
    }
    return calendar;
  };

  const generateYearCalendar = (year) => {
    return Array.from({ length: 12 }, (_, m) => new Date(year, m, 1));
  };

  const getSalesForDate = (date) =>
    invoices.filter(
      (inv) => new Date(inv.date).toDateString() === date.toDateString()
    );

  const getDaySalesAmount = (date) =>
    getSalesForDate(date).reduce(
      (total, inv) => total + (inv.totalAmount || 0),
      0
    );

  const getDayTransactionCount = (date) => getSalesForDate(date).length;

  // Chart Data
  const generateChartData = () => {
    const data = [];
    switch (timeRange) {
      case "daily":
        for (let hour = 0; hour < 24; hour += 2) {
          const hourSales = filteredData
            .filter((inv) => {
              const d = new Date(inv.date);
              return d.getHours() >= hour && d.getHours() < hour + 2;
            })
            .reduce((t, inv) => t + (inv.totalAmount || 0), 0);

          data.push({
            label: `${hour}:00-${hour + 2}:00`,
            value: hourSales,
            count: filteredData.filter((inv) => {
              const d = new Date(inv.date);
              return d.getHours() >= hour && d.getHours() < hour + 2;
            }).length,
          });
        }
        break;
      case "weekly":
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(
          (day, idx) => {
            const daySales = filteredData
              .filter((inv) => new Date(inv.date).getDay() === idx)
              .reduce((t, inv) => t + (inv.totalAmount || 0), 0);

            data.push({
              label: day,
              value: daySales,
              count: filteredData.filter(
                (inv) => new Date(inv.date).getDay() === idx
              ).length,
            });
          }
        );
        break;
      case "monthly":
        for (let week = 1; week <= 4; week++) {
          const weekSales = filteredData
            .filter((inv) => {
              const d = new Date(inv.date);
              const dom = d.getDate();
              return dom > (week - 1) * 7 && dom <= week * 7;
            })
            .reduce((t, inv) => t + (inv.totalAmount || 0), 0);

          data.push({
            label: `Week ${week}`,
            value: weekSales,
            count: filteredData.filter((inv) => {
              const d = new Date(inv.date);
              const dom = d.getDate();
              return dom > (week - 1) * 7 && dom <= week * 7;
            }).length,
          });
        }
        break;
      case "yearly":
        [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].forEach((m, idx) => {
          const mSales = filteredData
            .filter((inv) => new Date(inv.date).getMonth() === idx)
            .reduce((t, inv) => t + (inv.totalAmount || 0), 0);

          data.push({
            label: m,
            value: mSales,
            count: filteredData.filter(
              (inv) => new Date(inv.date).getMonth() === idx
            ).length,
          });
        });
        break;
    }
    return data;
  };

  const chartData = generateChartData();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="reports-container">
      <h1>Sales Reports & Analytics</h1>

      {/* Calendar Toggle */}
      <div className="calendar-toggle">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="calendar-btn">
          📅 {showCalendar ? "Hide Calendar" : "Show Calendar"}
        </button>
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div className="calendar-section">
          <div className="calendar-header">
            <h2>Select Date</h2>
            <div className="calendar-controls">
              <button onClick={() => setCalendarView("month")}>
                Month View
              </button>
              <button onClick={() => setCalendarView("year")}>Year View</button>
            </div>
          </div>

          {calendarView === "month" ? (
            <div className="month-calendar">
              <div className="calendar-nav">
                <button
                  onClick={() => {
                    const nm = selectedMonth === 1 ? 12 : selectedMonth - 1;
                    const ny =
                      selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                    setSelectedMonth(nm);
                    setSelectedYear(ny);
                  }}>
                  ←
                </button>

                <div className="month-year-selectors">
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}>
                    {monthNames.map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    const nm = selectedMonth === 12 ? 1 : selectedMonth + 1;
                    const ny =
                      selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                    setSelectedMonth(nm);
                    setSelectedYear(ny);
                  }}>
                  →
                </button>
              </div>

              <div className="week-days">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="week-day">
                    {d}
                  </div>
                ))}
              </div>

              {generateMonthCalendar(selectedYear, selectedMonth).map(
                (week, wi) => (
                  <div key={wi} className="calendar-week">
                    {week.map((date, di) => (
                      <div
                        key={di}
                        className={`calendar-day ${!date ? "empty" : ""} ${
                          date && date.toDateString() === selectedDate
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => date && handleDateSelect(date)}>
                        {date && (
                          <>
                            <div className="day-number">{date.getDate()}</div>
                            <div className="day-sales">
                              {getDayTransactionCount(date) > 0 ? (
                                <>
                                  <div className="sales-amount">
                                    {formatCurrency(getDaySalesAmount(date))}
                                  </div>
                                  <div className="sales-count">
                                    {getDayTransactionCount(date)} sale
                                    {getDayTransactionCount(date) !== 1
                                      ? "s"
                                      : ""}
                                  </div>
                                </>
                              ) : (
                                <div className="no-sales">No sales</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="year-calendar">
              <div className="calendar-nav">
                <button onClick={() => setSelectedYear((p) => p - 1)}>←</button>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button onClick={() => setSelectedYear((p) => p + 1)}>→</button>
              </div>

              <div className="year-grid">
                {generateYearCalendar(selectedYear).map((mDate, idx) => {
                  const mSales = invoices
                    .filter(
                      (inv) =>
                        new Date(inv.date).getMonth() === idx &&
                        new Date(inv.date).getFullYear() === selectedYear
                    )
                    .reduce((t, inv) => t + (inv.totalAmount || 0), 0);
                  const mTx = invoices.filter(
                    (inv) =>
                      new Date(inv.date).getMonth() === idx &&
                      new Date(inv.date).getFullYear() === selectedYear
                  ).length;
                  return (
                    <div
                      key={idx}
                      className="calendar-month"
                      onClick={() => {
                        setSelectedMonth(idx + 1);
                        setCalendarView("month");
                      }}>
                      <div className="month-name">
                        {mDate.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div className="month-sales">
                        {formatCurrency(mSales)}
                      </div>
                      <div className="month-transactions">
                        {mTx} sale{mTx !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      {showTransactions && (
        <div className="selected-date-info">
          <h2>Transactions for {formatDate(selectedDate)}</h2>
          <div className="transactions-list">
            {filteredData.length === 0 ? (
              <p>No transactions found for this date.</p>
            ) : (
              filteredData.map((invoice, idx) => (
                <div
                  key={idx}
                  className="transaction-item"
                  onClick={() => handleInvoiceClick(invoice)}
                  style={{ cursor: "pointer" }}>
                  <div className="transaction-header">
                    <span className="invoice-id">
                      {invoice.invoiceId ?? invoice._id}
                    </span>
                    <span className="transaction-time">
                      {new Date(invoice.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <span>Amount: {formatCurrency(invoice.totalAmount)}</span>
                    <span>Payment: {invoice.paymentMethod}</span>
                    <span>Items: {invoice.items.length}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <Receipt
          invoice={selectedInvoice}
          onClose={closeInvoiceDetails}
          onPrint={handlePrintReceipt}
        />
      )}

      {/* Summary */}
      <div className="data-summary">
        <h2>Report Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Time Range:</span>
            <span>{timeRange}</span>
          </div>
          <div className="summary-item">
            <span>Total Sales Amount:</span>
            <span>{formatCurrency(getTotalSales())}</span>
          </div>
          <div className="summary-item">
            <span>Number of Transactions:</span>
            <span>{getTransactionCount()}</span>
          </div>
          <div className="summary-item">
            <span>Average Transaction Value:</span>
            <span>{formatCurrency(getAverageSale())}</span>
          </div>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="quick-filters">
        {[
          { key: "ThisWeek", label: "This Week", icon: "📅" },
          { key: "ThisMonth", label: "This Month", icon: "🗓️" },
          { key: "ThisYear", label: "This Year", icon: "📊" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            className={`filter-btn ${timeRange === key ? "active" : ""}`}
            onClick={() => handleTimeRangeChange(key)}>
            <span className="icon">{icon}</span> {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportChart;
