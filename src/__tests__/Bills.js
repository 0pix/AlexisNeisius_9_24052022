/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock('../app/store', () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toContain("active-icon"); //correction
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  
  describe("When i click on new bill button", () =>{
    test("It should be sent to the new bill page", async () =>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const bills = new Bills({document, onNavigate, store:null, localStorage:window.localStorage})
      const newBillButton = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(bills.handleClickNewBill())
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
  })

  describe("When I click on the 'IconEye' button", () => {
    test("Then a modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      document.body.innerHTML = BillsUI({ data: bills })

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });


      $.fn.modal = jest.fn();
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      
      // const handleShowModalFile = jest.fn(() => {
      //   billsContainer.handleClickIconEye(iconEye);
      // });
      const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye(iconEye))
      
      iconEye.addEventListener("click", handleClickIconEye);
      
      userEvent.click(iconEye)
      const modale = document.getElementById('modaleFile')
      // await waitFor(() => expect(modale.classList).toContain("show"))
      expect(handleClickIconEye).toHaveBeenCalled()

      // expect(modal).toEqual(5)

      expect(modale).toBeTruthy()
      // expect(modale.classList).toContain("fade")
      // expect(modale.classList).toContain("show").toBeTruthy()
      // expect().toContain("show").toBeTruthy()
      expect(modale.getElementsByTagName("img")[0].alt).toEqual("Bill") 
    })
  })

  // describe("Get data", () => {
  //   test("Then get data", async () => {
  //     localStorage.setItem(
  //       "user",
  //       JSON.stringify({ type: "Employee", email: "a@a" })
  //     );
  //     const root = document.createElement("div");
  //     root.setAttribute("id", "root");
  //     document.body.append(root);
  //     router();

  //     window.onNavigate(ROUTES_PATH.Bills);
  //     await waitFor(() => screen.getByText("Mes notes de frais"));
  //     expect(screen.getByText("Mes notes de frais")).toBeTruthy();
  //   });

  //   describe("When I get bills", () => {
  //     test("Then it should render bills", async () => {
  //       const bills = new Bills({
  //         document,
  //         onNavigate,
  //         store: mockStore,
  //         localStorage: window.localStorage,
  //       });
  //       const getBills = jest.fn(() => bills.getBills());
  //       const value = await getBills();
  //       expect(getBills).toHaveBeenCalled();
  //       expect(value.length).toBe(4);
  //     });
  //   });

  //   test("Then it should display a 404 error message", async () => {
  //     mockStore.bills = jest.fn().mockImplementation(() => {
  //       Promise.reject(new Error("Erreur 404"));
  //     });
  //     const html = BillsUI({ error: "Erreur 404" });
  //     document.body.innerHTML = html;
  //     const message = screen.getByText(/Erreur 404/);
  //     expect(message).toBeTruthy();
  //   });

  //   test("Then it should display a 500 error message", async () => {
  //     mockStore.bills = jest.fn().mockImplementation(() => {
  //       Promise.reject(new Error("Erreur 500"));
  //     });
  //     const html = BillsUI({ error: "Erreur 500" });
  //     document.body.innerHTML = html;
  //     const message = screen.getByText(/Erreur 500/);
  //     expect(message).toBeTruthy();
  //   });
  // });

  describe('Given I am a user connected as Employee', () => {
    describe('When I navigate to Bills', () => {
      test('fetches bills from mock API GET', async () => {
        localStorage.setItem(
          'user',
          JSON.stringify({ type: 'Employee', email: 'a@a' })
        )
        const root = document.createElement('div')
        root.setAttribute('id', 'root')
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByText('Mes notes de frais'))
        expect(screen.getByTestId('btn-new-bill')).toBeTruthy()
      })
      describe('When an error occurs on API', () => {
        beforeEach(() => {
          jest.spyOn(mockStore, 'bills')
          Object.defineProperty(window, 'localStorage', {
            value: localStorageMock
          })
          window.localStorage.setItem('user', JSON.stringify({
              type: 'Employee',
              email: 'a@a'
          }))
          const root = document.createElement('div')
          root.setAttribute('id', 'root')
          document.body.appendChild(root)
          router()
        })
        test('fetches bills from an API and fails with 404 message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 404'))
              },
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })
  
        test('fetches messages from an API and fails with 500 message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 500'))
              },
            }
          })
  
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    });
  })

 








  // describe("When I click on the 'IconEye' button", () => {
  //   test("Then a modal should open", () => {
  //     Object.defineProperty(window, "localStorage", {
  //       value: localStorageMock,
  //     });
  //     window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

  //     document.body.innerHTML = BillsUI({ data: bills })

  //     const billsContainer = new Bills({
  //       document,
  //       onNavigate,
  //       store: mockStore,
  //       localStorage: window.localStorage
  //     });

  //     $.fn.modal = jest.fn();
  //     const iconEye = screen.getAllByTestId("icon-eye")[0];
  //     const handleShowModalFile = jest.fn((e) => {
  //       billsContainer.handleClickIconEye(e.target);
  //     });

  //     iconEye.addEventListener("click", handleShowModalFile);
  //     userEvent.click(iconEye);

  //     expect(handleShowModalFile).toHaveBeenCalled();
  //     expect(screen.getAllByText("Justificatif")).toBeTruthy();

  //   })
  // })
});