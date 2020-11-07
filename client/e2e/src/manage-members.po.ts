import { browser, by, element, ElementFinder } from 'protractor';

export class ManageMembersPage {
  navigateTo(): Promise<unknown> {
    const route = `${browser.baseUrl}/modify-members`
    return browser.get(route) as Promise<unknown>;
  }

  getCreateMemberButton(): ElementFinder {
    return element(by.id('create'));
  }

  getAdminMembersTable() {
    return element(by.tagName('table'))
  }


  getFirstNameColumn(First_Name) {
    return element(by.cssContainingText(
      '.cell_first_name',
      First_Name)
      );
  }
}