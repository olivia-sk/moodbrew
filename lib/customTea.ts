// client side of the custom tea flow: when the picker search comes up
// empty, this asks the tea-enrich edge function to have haiku build a
// catalog row for the typed name and save it as a private custom tea.
// the anthropic key never ships in the app bundle, same as tea-story
import { supabase } from './supabase';
import { parseTeaRow } from './teaMatching';
import { Tea, TeaRow } from './types';

export interface CustomTeaResult {
  tea: Tea;
  // true when the tea was already in the catalog (or already added by this
  // user) and no new row was created
  alreadyExisted: boolean;
}

// pulls the friendly error message out of a non-2xx edge function
// response, falling back to a generic line when the body is unreadable
async function readFunctionError(error: unknown): Promise<string> {
  const context = (error as { context?: Response }).context;
  if (context && typeof context.json === 'function') {
    try {
      const body = await context.json();
      if (typeof body?.error === 'string') return body.error;
    } catch {
      // fall through to the generic message
    }
  }
  return 'could not add that tea right now, try again in a moment';
}

// asks the tea-enrich edge function to create (or find) a tea for this
// name. throws with a user presentable message on failure
export async function createCustomTea(teaName: string): Promise<CustomTeaResult> {
  const { data, error } = await supabase.functions.invoke('tea-enrich', {
    body: { teaName },
  });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  const row = data?.tea as TeaRow | undefined;
  if (!row) {
    throw new Error('could not add that tea right now, try again in a moment');
  }

  return {
    tea: parseTeaRow(row),
    alreadyExisted: data?.alreadyExisted === true,
  };
}
