/**
 * React 19 compatibility layer for testing-library
 *
 * React 19 moved `act` from react-dom/test-utils to react.
 * This file provides the act function from the correct location
 * for use with @testing-library/react.
 */

import { act } from 'react';

export { act };
export default { act };
