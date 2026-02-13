// Utility to format annual salary (in INR) into LPA (Lakhs Per Annum)
// Examples:
// 1200000 -> ₹12 LPA
// 850000 -> ₹8.5 LPA
// 82000 -> ₹0.82 LPA

export function formatSalaryLPA(value, { withCurrency = true } = {}) {
    if (value === null || value === undefined) return "";
    const num = Number(value);
    if (Number.isNaN(num)) return "";

    const lpa = num / 100000; // 1 Lakh = 100,000

    // Format with sensible precision
    let text;
    if (lpa >= 10) text = lpa.toFixed(0);
    else if (lpa >= 1) text = lpa.toFixed(1);
    else text = lpa.toFixed(2);

    return `${withCurrency ? "₹" : ""}${text} LPA`;
}

export default formatSalaryLPA;
