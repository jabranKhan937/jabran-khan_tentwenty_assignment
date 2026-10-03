export type SearchTicket = {
  id: number;
  signal: AbortSignal;
};

export type SearchSession = {
  begin: () => SearchTicket;
  isCurrent: (id: number) => boolean;
};

export function createSearchSession(): SearchSession {
  let current = 0;
  let controller: AbortController | null = null;

  return {
    begin() {
      controller?.abort();
      current += 1;
      controller = new AbortController();
      return { id: current, signal: controller.signal };
    },
    isCurrent(id: number) {
      return id === current;
    },
  };
}

export function takeSearchResult<T>(session: SearchSession, id: number, result: T): T | null {
  if (!session.isCurrent(id)) {
    return null;
  }

  return result;
}
