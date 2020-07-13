/* eslint no-multi-assign:0, no-undef:0 */
import { isMiniApp, isWeChatMiniProgram, isByteDanceMicroApp } from 'universal-env';
import { SHOW, HIDE, ERROR, LAUNCH, NOT_FOUND, SHARE, TAB_ITEM_CLICK } from './constants';

export const isFunction = target => typeof target === 'function';

export const appCycles = {};

/**
 * Emit life cycle callback
 * @param {string} cycle cycle name
 * @param {object} context callback's context when executed
 * @param  {...any} args callback params
 */
export function emit(cycle, context, ...args) {
  if (appCycles.hasOwnProperty(cycle)) {
    const cycles = appCycles[cycle];
    let fn;
    if (cycle === SHARE) {
      // In MiniApp, it need return callback result as share info, like { title, desc, path }
      args[0].content = context ? cycles[0].call(context, args[1]) : cycles[0](args[1]);
    } else {
      while (fn = cycles.shift()) { // eslint-disable-line
        context ? fn.apply(context, args) : fn(...args);
      }
    }
  }
}

export function addAppLifeCyle(cycle, callback) {
  if (isFunction(callback)) {
    const cycles = appCycles[cycle] = appCycles[cycle] || [];
    cycles.push(callback);
  }
}

// All of the following hooks will be removed when the future break change
export function useAppLaunch(callback) {
  addAppLifeCyle(LAUNCH, callback);
}

export function useAppShow(callback) {
  addAppLifeCyle(SHOW, callback);
}

export function useAppHide(callback) {
  addAppLifeCyle(HIDE, callback);
}

export function useAppError(callback) {
  addAppLifeCyle(ERROR, callback);
}

export function usePageNotFound(callback) {
  addAppLifeCyle(NOT_FOUND, callback);
}

export function useAppShare(callback) {
  addAppLifeCyle('appshare', callback);
}

// Emit MiniApp App lifeCycles
if (isMiniApp || isWeChatMiniProgram || isByteDanceMicroApp) {
  window.addEventListener(LAUNCH, ({ options, context }) => {
    emit(LAUNCH, context, options);
  });
  window.addEventListener('appshow', ({ options, context }) => {
    emit(SHOW, context, options);
  });
  window.addEventListener('apphide', ({ context }) => {
    emit(HIDE, context);
  });
  window.addEventListener('apperror', ({ context, error }) => {
    emit(ERROR, context, error);
  });
  window.addEventListener('pagenotfound', ({ context }) => {
    emit(NOT_FOUND, context);
  });
  window.addEventListener('appshare', ({ context, shareInfo, options }) => {
    emit(SHARE, context, shareInfo, options);
  });
  window.addEventListener('tabitemclick', ({ options, context }) => {
    emit(TAB_ITEM_CLICK, context, options);
  });
} else {
  // Emit Web lifeCycles
  window.addEventListener('error', event => {
    emit(ERROR, null, event.error);
  });
}