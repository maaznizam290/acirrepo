@order @impersonation @smoke
Feature: CSR creates an order after impersonating a customer
  As a Customer Service Representative (CSR)
  I want to impersonate a customer and place an order on their behalf
  So that the customer's order is created accurately through the OMS portal

  Background:
    Given the CSR launches the browser and navigates to the OMS sign-in page

  @regression @critical
  Scenario: CSR successfully places an order on behalf of an impersonated customer
    Given the CSR logs in with valid credentials
    When the CSR navigates to "Customer" and then "Manage Customer"
    And the CSR searches for customer "Hiba" and applies the filter
    And the CSR opens customer "Hiba" and impersonates the customer
    And the CSR searches for product "Apple" and adds the first suggestion to the cart with quantity 6
    And the CSR searches for product "Aproten" and adds the first suggestion to the cart with quantity 7
    And the CSR opens the mini cart and proceeds to checkout
    And the CSR selects "Invoice" as the payment method
    And the CSR clicks the final "Checkout" button
    Then the order should be placed successfully
