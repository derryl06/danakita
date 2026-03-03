/**
 * Calculate the future value of a target based on inflation
 * @param {number} presentValue - The target amount in today's money
 * @param {string} deadline - YYYY-MM string
 * @param {number} annualRate - Inflation rate in percentage (e.g., 5)
 * @returns {number} - The adjusted future target amount
 */
export const calculateInflationAdjusted = (presentValue, deadline, annualRate = 5) => {
    if (!deadline || presentValue <= 0) return presentValue;

    const targetDate = new Date(deadline + '-01');
    const today = new Date();

    // Calculate total months difference
    const diffMonths = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());

    if (diffMonths <= 0) return presentValue;

    const years = diffMonths / 12;
    // Formula: FV = PV * (1 + r)^n
    const rate = annualRate / 100;
    const futureValue = presentValue * Math.pow(1 + rate, years);

    return Math.round(futureValue);
};

export const formatCurrency = (num) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
};
