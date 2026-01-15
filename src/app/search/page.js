import { Suspense } from 'react';
import SearchResultsClient from './SearchResultsClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 80, textAlign: 'center' }}>Loading search results…</div>}>
      <SearchResultsClient />
    </Suspense>
  );
}
