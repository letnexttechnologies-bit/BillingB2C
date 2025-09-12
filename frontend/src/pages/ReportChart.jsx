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

  // ✅ FIX: async fetch
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const allInvoices = await getInvoices(); // wait for API
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
          setInvoices([]);
        }
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        setInvoices([]);
      }
    };

    fetchInvoices();
  }, []);

  const filterData = (data = [], range, year, month, week) => {
    if (!Array.isArray(data)) {
      console.warn("filterData expected array but got:", data);
      setFilteredData([]);
      return;
    }

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

      default:
        filtered = data;
    }

    setFilteredData(filtered);
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
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

  const getTotalSales = () => {
    return filteredData.reduce(
      (total, inv) => total + (inv.totalAmount || 0),
      0
    );
  };

  const getTransactionCount = () => {
    return filteredData.length;
  };

  const getAverageSale = () => {
    return filteredData.length > 0 ? getTotalSales() / filteredData.length : 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Calendar generation functions
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
    const months = [];
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1));
    }
    return months;
  };

  const getSalesForDate = (date) => {
    return invoices.filter(
      (inv) => new Date(inv.date).toDateString() === date.toDateString()
    );
  };

  const getDaySalesAmount = (date) => {
    const dayInvoices = getSalesForDate(date);
    return dayInvoices.reduce((total, inv) => total + inv.totalAmount, 0);
  };

  const getDayTransactionCount = (date) => {
    return getSalesForDate(date).length;
  };

  const monthCalendar = generateMonthCalendar(selectedYear, selectedMonth);
  const yearCalendar = generateYearCalendar(selectedYear);

  const generateChartData = () => {
    const data = [];

    switch (timeRange) {
      case "daily":
        // Group by 2-hour intervals for better fit
        for (let hour = 0; hour < 24; hour += 2) {
          const hourSales = filteredData
            .filter((inv) => {
              const date = new Date(inv.date);
              return date.getHours() >= hour && date.getHours() < hour + 2;
            })
            .reduce((total, inv) => total + inv.totalAmount, 0);

          data.push({
            label: `${hour}:00-${hour + 2}:00`,
            value: hourSales,
            count: filteredData.filter((inv) => {
              const date = new Date(inv.date);
              return date.getHours() >= hour && date.getHours() < hour + 2;
            }).length,
          });
        }
        break;

      case "weekly":
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        days.forEach((day, index) => {
          const daySales = filteredData
            .filter((inv) => {
              const date = new Date(inv.date);
              return date.getDay() === index;
            })
            .reduce((total, inv) => total + inv.totalAmount, 0);

          data.push({
            label: day,
            value: daySales,
            count: filteredData.filter(
              (inv) => new Date(inv.date).getDay() === index
            ).length,
          });
        });
        break;

      case "monthly":
        const weeksInMonth = 4;
        for (let week = 1; week <= weeksInMonth; week++) {
          const weekSales = filteredData
            .filter((inv) => {
              const date = new Date(inv.date);
              const dayOfMonth = date.getDate();
              return dayOfMonth > (week - 1) * 7 && dayOfMonth <= week * 7;
            })
            .reduce((total, inv) => total + inv.totalAmount, 0);

          data.push({
            label: `Week ${week}`,
            value: weekSales,
            count: filteredData.filter((inv) => {
              const date = new Date(inv.date);
              const dayOfMonth = date.getDate();
              return dayOfMonth > (week - 1) * 7 && dayOfMonth <= week * 7;
            }).length,
          });
        }
        break;

      case "yearly":
        const months = [
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
        ];
        months.forEach((month, index) => {
          const monthSales = filteredData
            .filter((inv) => {
              const date = new Date(inv.date);
              return date.getMonth() === index;
            })
            .reduce((total, inv) => total + inv.totalAmount, 0);

          data.push({
            label: month,
            value: monthSales,
            count: filteredData.filter(
              (inv) => new Date(inv.date).getMonth() === index
            ).length,
          });
        });
        break;
    }

    return data;
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const weekOptions = Array.from({ length: 52 }, (_, i) => i + 1);

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

      {/* Calendar Toggle Button */}
      <div className="calendar-toggle">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="calendar-btn">
          📅 {showCalendar ? "Hide Calendar" : "Show Calendar"}
        </button>
      </div>

      {/* Calendar View */}
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
                    const newMonth =
                      selectedMonth === 1 ? 12 : selectedMonth - 1;
                    const newYear =
                      selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                    setSelectedMonth(newMonth);
                    setSelectedYear(newYear);
                  }}>
                  ←
                </button>

                <div className="month-year-selectors">
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="month-selector">
                    {monthNames.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="year-selector">
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    const newMonth =
                      selectedMonth === 12 ? 1 : selectedMonth + 1;
                    const newYear =
                      selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                    setSelectedMonth(newMonth);
                    setSelectedYear(newYear);
                  }}>
                  →
                </button>
              </div>

              <div className="week-days">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="week-day">
                      {day}
                    </div>
                  )
                )}
              </div>

              {monthCalendar.map((week, weekIndex) => (
                <div key={weekIndex} className="calendar-week">
                  {week.map((date, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`calendar-day ${date ? "" : "empty"} ${
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
              ))}
            </div>
          ) : (
            <div className="year-calendar">
              <div className="calendar-nav">
                <button onClick={() => setSelectedYear((prev) => prev - 1)}>
                  ←
                </button>

                <div className="year-selector-container">
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="year-selector">
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <button onClick={() => setSelectedYear((prev) => prev + 1)}>
                  →
                </button>
              </div>

              <div className="year-grid">
                {yearCalendar.map((monthDate, index) => {
                  const monthSales = invoices
                    .filter(
                      (inv) =>
                        new Date(inv.date).getMonth() === index &&
                        new Date(inv.date).getFullYear() === selectedYear
                    )
                    .reduce((total, inv) => total + inv.totalAmount, 0);

                  const monthTransactions = invoices.filter(
                    (inv) =>
                      new Date(inv.date).getMonth() === index &&
                      new Date(inv.date).getFullYear() === selectedYear
                  ).length;

                  return (
                    <div
                      key={index}
                      className="calendar-month"
                      onClick={() => {
                        setSelectedMonth(index + 1);
                        setCalendarView("month");
                      }}>
                      <div className="month-name">
                        {monthDate.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                      <div className="month-sales">
                        {formatCurrency(monthSales)}
                      </div>
                      <div className="month-transactions">
                        {monthTransactions} sale
                        {monthTransactions !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Date Info */}
      {showTransactions && (
        <div className="selected-date-info">
          <h2>Transactions for {formatDate(selectedDate)}</h2>
          <div className="transactions-list">
            {filteredData.length === 0 ? (
              <p>No transactions found for this date.</p>
            ) : (
              filteredData.map((invoice, index) => (
                <div
                  key={index}
                  className="transaction-item"
                  onClick={() => handleInvoiceClick(invoice)}
                  style={{ cursor: "pointer" }}>
                  <div className="transaction-header">
                    <span className="invoice-id">Invoice #{invoice.id}</span>
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

      {/* New Invoice Details Modal (Replaced with Receipt component) */}
      {showInvoiceDetails && selectedInvoice && (
        <Receipt
          invoice={selectedInvoice}
          onClose={closeInvoiceDetails}
          onPrint={handlePrintReceipt}
        />
      )}

      {/* Data Summary */}
      <div className="data-summary">
        <h2>Report Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Time Range:</span>
            <span>
              {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            </span>
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
    </div>
  );
};

export default ReportChart;
