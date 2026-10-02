

export class FinanceService {

  async createExpense(data: {
    businessId: string;
    branchId?: string;
    category: string;
    description: string;
    amount: number;
    reference?: string;
  }) {
    console.log("Finance expense queued:", data);

    // TODO:
    // Replace this with your actual Finance Expense model
    // once we integrate Finance.

    return data;
  }

  async createIncome(data: {
    businessId: string;
    branchId?: string;
    category: string;
    description: string;
    amount: number;
    reference?: string;
  }) {
    console.log("Finance income queued:", data);

    return data;
  }

}
export const financeService =
  new FinanceService();
