import { supabase } from '@/src/lib/supabase';
import type {
  BodyCheckin,
  BodyMeasurement,
  CheckinType,
  ProgressPhoto,
} from '@/src/types/domain';

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Non connecté');
  return data.user.id;
}

// --- Bilans corporels --------------------------------------------------------

export async function listCheckins(): Promise<BodyCheckin[]> {
  const { data, error } = await supabase
    .from('body_checkins')
    .select('*')
    .order('checkin_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Le bilan initial — la référence de départ, jamais écrasée. */
export async function getInitialCheckin(): Promise<BodyCheckin | null> {
  const { data, error } = await supabase
    .from('body_checkins')
    .select('*')
    .eq('checkin_type', 'initial')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLatestCheckin(): Promise<BodyCheckin | null> {
  const { data, error } = await supabase
    .from('body_checkins')
    .select('*')
    .order('checkin_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCheckin(
  input: Pick<BodyCheckin, 'checkin_date' | 'checkin_type'> &
    Partial<Pick<BodyCheckin, 'weight_kg' | 'energy' | 'motivation' | 'notes'>>,
): Promise<BodyCheckin> {
  const uid = await userId();
  const { data, error } = await supabase
    .from('body_checkins')
    .insert({ ...input, user_id: uid })
    .select()
    .single();
  if (error) throw error;

  // Le poids d'un bilan alimente aussi la courbe de poids quotidienne.
  if (input.weight_kg != null) {
    await supabase
      .from('weight_entries')
      .upsert(
        { user_id: uid, entry_date: input.checkin_date, weight_kg: input.weight_kg },
        { onConflict: 'user_id,entry_date' },
      );
  }
  return data;
}

// --- Mensurations ------------------------------------------------------------

export async function getCheckinMeasurements(checkinId: string): Promise<BodyMeasurement[]> {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('checkin_id', checkinId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addMeasurements(
  measurements: Array<
    Pick<
      BodyMeasurement,
      'measurement_type' | 'side' | 'measurement_state' | 'value_cm' | 'measured_on'
    > &
      Partial<Pick<BodyMeasurement, 'checkin_id' | 'custom_label'>>
  >,
): Promise<void> {
  if (measurements.length === 0) return;
  const uid = await userId();
  const { error } = await supabase
    .from('body_measurements')
    .insert(measurements.map((m) => ({ ...m, user_id: uid })));
  if (error) throw error;
}

/**
 * Historique complet des mensurations, de la plus récente à la plus ancienne
 * (graphiques d'évolution + « dernière valeur connue » à la saisie).
 */
export async function listMeasurements(limit = 500): Promise<BodyMeasurement[]> {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .order('measured_on', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// --- Photos d'un bilan ---------------------------------------------------------

export async function getCheckinPhotos(checkinId: string): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('checkin_id', checkinId)
    .order('photo_type');
  if (error) throw error;
  return data ?? [];
}

// --- Rappel mensuel -------------------------------------------------------------

/** Reporte le rappel de bilan mensuel à une date ultérieure. */
export async function snoozeCheckinReminder(untilISO: string): Promise<void> {
  const uid = await userId();
  const { error } = await supabase
    .from('profiles')
    .update({ checkin_snoozed_until: untilISO })
    .eq('user_id', uid);
  if (error) throw error;
}
