/**
 * @jest-environment jsdom
 */
import { TPersonAttributes } from "@fastform/types/people";
import fastform from "../src/index";
import {
  mockEventTrackResponse,
  mockInitResponse,
  mockResetResponse,
  mockRegisterRouteChangeResponse,
  mockSetCustomAttributeResponse,
  mockSetEmailIdResponse,
  mockSetUserIdResponse,
  mockUpdateEmailResponse,
} from "./__mocks__/apiMock";
import { constants } from "./constants";

const consoleLogMock = jest.spyOn(console, "log").mockImplementation();

test("Test Jest", () => {
  expect(1 + 9).toBe(10);
});

const {
  environmentId,
  apiHost,
  initialUserId,
  initialUserEmail,
  updatedUserEmail,
  customAttributeKey,
  customAttributeValue,
} = constants;

beforeEach(() => {
  fetchMock.resetMocks();
});

/* test("Fastform should Initialise", async () => {
  mockInitResponse();

  await fastform.init({
    environmentId,
    apiHost,
    userId: initialUserId,
  });

  const configFromBrowser = localStorage.getItem("fastform-js");
  expect(configFromBrowser).toBeTruthy();

  if (configFromBrowser) {
    const jsonSavedConfig = JSON.parse(configFromBrowser);
    expect(jsonSavedConfig.environmentId).toStrictEqual(environmentId);
    expect(jsonSavedConfig.apiHost).toStrictEqual(apiHost);
  }
});

test("Fastform should set email", async () => {
  mockSetEmailIdResponse();
  await fastform.setEmail(initialUserEmail);

  const currentStatePerson = fastform.getPerson();

  const currentStatePersonAttributes = currentStatePerson.attributes;
  const numberOfUserAttributes = Object.keys(currentStatePersonAttributes).length;
  expect(numberOfUserAttributes).toStrictEqual(2);

  const userId = currentStatePersonAttributes.userId;
  expect(userId).toStrictEqual(initialUserId);
  const email = currentStatePersonAttributes.email;
  expect(email).toStrictEqual(initialUserEmail);
});

test("Fastform should set custom attribute", async () => {
  mockSetCustomAttributeResponse();
  await fastform.setAttribute(customAttributeKey, customAttributeValue);

  const currentStatePerson = fastform.getPerson();

  const currentStatePersonAttributes = currentStatePerson.attributes;
  const numberOfUserAttributes = Object.keys(currentStatePersonAttributes).length;
  expect(numberOfUserAttributes).toStrictEqual(3);

  const userId = currentStatePersonAttributes.userId;
  expect(userId).toStrictEqual(initialUserId);
  const email = currentStatePersonAttributes.email;
  expect(email).toStrictEqual(initialUserEmail);
  const customAttribute = currentStatePersonAttributes[customAttributeKey];
  expect(customAttribute).toStrictEqual(customAttributeValue);
});

test("Fastform should update attribute", async () => {
  mockUpdateEmailResponse();
  await fastform.setEmail(updatedUserEmail);

  const currentStatePerson = fastform.getPerson();

  const currentStatePersonAttributes = currentStatePerson.attributes;

  const numberOfUserAttributes = Object.keys(currentStatePersonAttributes).length;
  expect(numberOfUserAttributes).toStrictEqual(3);

  const userId = currentStatePersonAttributes.userId;
  expect(userId).toStrictEqual(initialUserId);
  const email = currentStatePersonAttributes.email;
  expect(email).toStrictEqual(updatedUserEmail);
  const customAttribute = currentStatePersonAttributes[customAttributeKey];
  expect(customAttribute).toStrictEqual(customAttributeValue);
});

test("Fastform should track event", async () => {
  mockEventTrackResponse();
  const mockButton = document.createElement("button");
  mockButton.addEventListener("click", async () => {
    await fastform.track("Button Clicked");
  });
  await mockButton.click();
  expect(consoleLogMock).toHaveBeenCalledWith(
    expect.stringMatching(/Fastform: Event "Button Clicked" tracked/)
  );
}); 

test("Fastform should register for route change", async () => {
  mockRegisterRouteChangeResponse();
  await fastform.registerRouteChange();
  expect(consoleLogMock).toHaveBeenCalledWith(expect.stringMatching(/Checking page url/));
});

test("Fastform should reset", async () => {
  mockResetResponse();
  await fastform.reset();
  const currentStatePerson = fastform.getPerson();
  const currentStatePersonAttributes = currentStatePerson.attributes;

  expect(Object.keys(currentStatePersonAttributes).length).toBe(0);
});
 */
