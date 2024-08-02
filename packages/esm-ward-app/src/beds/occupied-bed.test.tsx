import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, defaultPatientCardElementConfig } from '../config-schema';
import {
  mockAdmissionLocation,
  mockLocationInpatientWard,
  mockPatientAlice,
  mockPatientBrian,
} from '../../../../__mocks__';
import { bedLayoutToBed, filterBeds } from '../ward-view/ward-view.resource';
import useWardLocation from '../hooks/useWardLocation';
import OccupiedBed from './occupied-bed.component';

const defaultConfig = getDefaultsFromConfigSchema(configSchema);

jest.mocked(useConfig).mockReturnValue(defaultConfig);

const mockBedLayouts = filterBeds(mockAdmissionLocation);

jest.mock('../hooks/useWardLocation', () => jest.fn());

const mockedUseWardLocation = useWardLocation as jest.Mock;
mockedUseWardLocation.mockReturnValue({
  location: mockLocationInpatientWard,
  isLoadingLocation: false,
  errorFetchingLocation: null,
  invalidLocation: false,
});

const mockBedToUse = mockBedLayouts[0];
const mockBed = bedLayoutToBed(mockBedToUse);

describe('Occupied bed', () => {
  it('renders a single bed with patient details', () => {
    render(<OccupiedBed wardPatients={[{ patient: mockPatientAlice, admitted: true }]} bed={mockBed} />);
    const patientName = screen.getByText('Alice Johnson');
    expect(patientName).toBeInTheDocument();
    const patientAge = `${mockPatientAlice.person.age} yrs`;
    expect(screen.getByText(patientAge)).toBeInTheDocument();
    const defaultAddressFields = defaultPatientCardElementConfig.address.addressFields;
    defaultAddressFields.forEach((addressField) => {
      const addressFieldValue = mockPatientAlice.person.preferredAddress[addressField] as string;
      expect(screen.getByText(addressFieldValue)).toBeInTheDocument();
    });
  });

  it('renders a divider for shared patients', () => {
    render(
      <OccupiedBed
        bed={mockBed}
        wardPatients={[
          { patient: mockPatientAlice, admitted: true },
          { patient: mockPatientBrian, admitted: true },
        ]}
      />,
    );
    const bedShareText = screen.getByTitle('Bed share');
    expect(bedShareText).toBeInTheDocument();
  });
});
