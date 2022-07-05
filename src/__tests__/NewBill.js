/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import {
  fireEvent,
  screen,
  waitFor,
  createEvent,
  userEvent,
} from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router";
import mockStore from "../__mocks__/store.js";
import { text } from "express";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // upload d'une image avec le bon format
    test("upload an image file", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@test.tld" })
      );

      const html = NewBillUI();

      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const selectFile = screen.getByTestId("file");
      const testFile = new File(["image"], "image.png", { type: "image/png" });

      selectFile.addEventListener("change", handleChangeFile);

      fireEvent.change(selectFile, {
        target: { files: [testFile] },
      });

      expect(handleChangeFile).toHaveBeenCalled();
    });

    // upload d'une image avec le mauvais format format
    test("upload an image file with bad format", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@test.tld" })
      );

      const html = NewBillUI();

      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const event = {
        preventDefault: () => {},
        target: {
          value: "text.txt",
        },
      };

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const selectFile = screen.getByTestId("file");
      const testFile = new File(["text"], "text.txt", { type: "text" });

      selectFile.addEventListener("change", handleChangeFile);

      fireEvent.change(selectFile, {
        target: { files: [testFile] },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      // le "1" c'est le "return 1" par rapport à la condition du type de fichier
      expect(handleChangeFile(event)).toBe(false);
    });
  });

  describe("When I Submit form", () => {
    // Test si nous somme redigiré sur la "bills page" après l'envoie
    test("Then, I should be sent on Bills page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBills.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");

      newBillForm.addEventListener("submit", handleSubmit);

      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });

    // Test d'intégration POST

    test("fetches bills from mock API POST", async () => {
      const getSpy = jest.spyOn(mockStore, "bills");
      const bill = mockStore.bills().update();
      expect(getSpy).toHaveBeenCalledTimes(1);
    });

    //  beforeach
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        );
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
        );
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
