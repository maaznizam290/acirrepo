import { Locator, Page } from '@playwright/test';
import { CommonActions } from '../utils/CommonActions';
import { WaitHelper } from '../utils/WaitHelper';

export class CustomerPage {
    waitForImpersonationDelay(_arg0: number) {
      throw new Error('Method not implemented.');
    }
    waitForSearchResultsDelay(_arg0: number) {
      throw new Error('Method not implemented.');
    }

    private readonly page: Page;
    private readonly actions: CommonActions;
    private readonly waitHelper: WaitHelper;

    private readonly customerSearchInput: Locator;
    private readonly applyFilterButton: Locator;
    private readonly impersonateButton: Locator;

    constructor(page: Page) {

        this.page = page;

        this.actions = new CommonActions(page);
        this.waitHelper = new WaitHelper(page);

        this.customerSearchInput =
            page.locator('#ctl00_bodyContentPlaceholder_FilteredListing_ctl02_ctl05_Value');

        this.applyFilterButton =
            page.getByRole('button', { name: /apply filter/i });

        this.impersonateButton =
            page.getByRole('link', { name: /impersonate customer/i });
    }

    private customerResult(customerName: string): Locator {

        return this.page.getByRole('link', {
            name: new RegExp(customerName, 'i')
        });
    }

    public async searchCustomer(customerName: string): Promise<void> {

        await this.waitHelper.waitForVisible(this.customerSearchInput);

        await this.actions.fill(
            this.customerSearchInput,
            customerName,
            'Customer Name'
        );
    }

    public async applyFilter(): Promise<void> {

        await this.actions.click(
            this.applyFilterButton,
            'Apply Filter'
        );
    }

    public async openCustomer(customerName: string): Promise<void> {

        const customer = this.customerResult(customerName);

        await this.waitHelper.waitForVisible(customer);

        await this.actions.click(
            customer,
            customerName
        );
    }

    public async impersonateCustomer(): Promise<void> {

        await this.waitHelper.waitForVisible(
            this.impersonateButton
        );

        await this.actions.click(
            this.impersonateButton,
            'Impersonate Customer'
        );
    }

    /**
     * Complete flow
     */

    public async searchAndImpersonateCustomer(customerName: string): Promise<void> {

        await this.searchCustomer(customerName);

        await this.applyFilter();

        // Business requirement
        await this.waitHelper.waitForFixedDelay(5, 'Allowing search results to load');

        await this.openCustomer(customerName);

        await this.impersonateCustomer();

        // Business requirement
        await this.waitHelper.waitForFixedDelay(3, 'Allowing impersonation to complete');
    }

}