import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../../App';

jest.setTimeout(30000);

/**
 * PRD Testing requirement: "UI/screen layer: smoke tests for onboarding →
 * Phase 2 → Battle Loop → Pomodoro navigation flow." Walks the full demo
 * path a judge would tap through, using choice index 0 (every authored
 * regrouping question's correctIndex) to clear the battle deterministically.
 * RNTL v14's render/fireEvent are async, and real timers are used so Phase
 * 2's beat timers and the Animated "Tuklas noticed" banner resolve exactly
 * as they do on-device.
 */
describe('Onboarding -> Map -> Phase 2 -> Battle -> Pomodoro smoke flow', () => {
  it('walks a judge from profile pick through to the post-victory Pomodoro screen', async () => {
    const { getByTestId, queryByTestId } = await render(<App />);

    expect(getByTestId('profile-card-player3')).toBeTruthy();
    await fireEvent.press(getByTestId('profile-card-player3'));

    await waitFor(() => expect(getByTestId('open-roster')).toBeTruthy());
    expect(getByTestId('level-node-level3')).toBeTruthy();
    await fireEvent.press(getByTestId('level-node-level3'));
    await waitFor(() => expect(getByTestId('level-play-button')).toBeTruthy());
    await fireEvent.press(getByTestId('level-play-button'));

    await waitFor(() => expect(getByTestId('phase2-beat-pile')).toBeTruthy());

    for (let beat = 1; beat < 5; beat += 1) {
      await fireEvent.press(getByTestId('beat-next-button'));
    }

    await waitFor(() => expect(getByTestId('lets-go-button')).toBeTruthy());
    await fireEvent.press(getByTestId('lets-go-button'));

    await waitFor(() => expect(getByTestId('question-card')).toBeTruthy());

    let guard = 0;
    while (!queryByTestId('victory-block') && guard < 10) {
      await fireEvent.press(getByTestId('choice-0'));
      await fireEvent.press(getByTestId('submit-answer'));
      if (queryByTestId('victory-block')) break;
      await fireEvent.press(getByTestId('continue-button'));
      guard += 1;
    }
    expect(getByTestId('victory-block')).toBeTruthy();

    await fireEvent.press(getByTestId('acknowledge-victory'));
    await waitFor(() => expect(getByTestId('pomodoro-timer')).toBeTruthy());
  });
});
