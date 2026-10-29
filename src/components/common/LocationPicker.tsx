/**
 * LocationPicker
 *
 * A self-contained map picker that loads Leaflet from CDN (no extra npm install).
 * - Type an address → click "Search" (or press Enter) → map geocodes it via
 *   OpenStreetMap Nominatim and drops a pin; lat/lng fill automatically.
 * - Click anywhere on the map → pin moves; lat/lng and address fill automatically
 *   via reverse-geocode.
 *
 * Usage:
 *   <LocationPicker
 *     address={address}
 *     latitude={lat}
 *     longitude={lng}
 *     onChange={(a, lat, lng) => { ... }}
 *   />
 */

import { useEffect, useRef, useState } from 'react'
import { Button, Input, Spin } from 'antd'
import { Search } from 'lucide-react'

// ─── CDN URLs ────────────────────────────────────────────────────────────────
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

// ─── Types (thin wrappers so we don't import leaflet types) ──────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LMap = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LMarker = any

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
    // JS (already loaded?)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) { resolve(); return }
    if (document.querySelector(`script[src="${LEAFLET_JS}"]`)) {
      // already injected, wait
      const poll = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).L) { clearInterval(poll); resolve() }
      }, 50)
      return
    }
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.head.appendChild(script)
  })
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number; display_name: string } | null> {
  const params = new URLSearchParams({ q: address, format: 'json', limit: '1' })
  const res = await fetch(`${NOMINATIM_SEARCH}?${params}`, { headers: { Accept: 'application/json' } })
  const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>
  if (!data.length) return null
  return { lat: Number(data[0].lat), lon: Number(data[0].lon), display_name: data[0].display_name }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), format: 'json' })
  const res = await fetch(`${NOMINATIM_REVERSE}?${params}`, { headers: { Accept: 'application/json' } })
  const data = await res.json() as { display_name?: string }
  return data.display_name ?? ''
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface LocationPickerProps {
  /** Current address string (controlled) */
  address: string
  /** Current latitude string (controlled) */
  latitude: string
  /** Current longitude string (controlled) */
  longitude: string
  /** Called whenever address / coordinates change */
  onChange: (address: string, latitude: string, longitude: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LocationPicker({ address, latitude, longitude, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const lMapRef = useRef<LMap>(null)
  const markerRef = useRef<LMarker>(null)
  const [leafletReady, setLeafletReady] = useState(false)
  const [searchText, setSearchText] = useState(address)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  // ── Load Leaflet once ──────────────────────────────────────────────────────
  useEffect(() => {
    loadLeaflet()
      .then(() => setLeafletReady(true))
      .catch(() => setSearchError('Could not load map library.'))
  }, [])

  // ── Initialise map once Leaflet is ready ───────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L

    // Default centre: Middle East / MENA region
    const initLat = latitude ? Number(latitude) : 24.7136
    const initLng = longitude ? Number(longitude) : 46.6753

    const map: LMap = L.map(mapRef.current, { zoomControl: true }).setView([initLat, initLng], latitude ? 14 : 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Custom gold marker icon
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        background:#c9961b;border:3px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.35);
        transform:rotate(-45deg);
      "></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    let marker: LMarker | null = null

    if (latitude && longitude) {
      marker = L.marker([Number(latitude), Number(longitude)], { icon, draggable: true }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', async () => {
        const pos = marker!.getLatLng()
        const addr = await reverseGeocode(pos.lat, pos.lng)
        onChange(addr, String(pos.lat.toFixed(6)), String(pos.lng.toFixed(6)))
        setSearchText(addr)
      })
    }

    map.on('click', async (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng
      if (marker) {
        marker.setLatLng([lat, lng])
      } else {
        marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map)
        markerRef.current = marker

        marker.on('dragend', async () => {
          const pos = marker!.getLatLng()
          const addr = await reverseGeocode(pos.lat, pos.lng)
          onChange(addr, String(pos.lat.toFixed(6)), String(pos.lng.toFixed(6)))
          setSearchText(addr)
        })
      }
      const addr = await reverseGeocode(lat, lng)
      onChange(addr, String(lat.toFixed(6)), String(lng.toFixed(6)))
      setSearchText(addr)
    })

    lMapRef.current = map

    return () => {
      map.remove()
      lMapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady])

  // ── Keep searchText in sync when form resets (e.g. open edit) ─────────────
  useEffect(() => {
    setSearchText(address)
  }, [address])

  // ── Search handler ─────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchText.trim()) return
    setSearching(true)
    setSearchError('')
    try {
      const result = await geocodeAddress(searchText.trim())
      if (!result) { setSearchError('Address not found. Try a more specific query.'); return }

      onChange(result.display_name, String(result.lat.toFixed(6)), String(result.lon.toFixed(6)))
      setSearchText(result.display_name)

      const map = lMapRef.current
      if (map) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L
        map.setView([result.lat, result.lon], 15)

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:#c9961b;border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,.35);
            transform:rotate(-45deg);
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        if (markerRef.current) {
          markerRef.current.setLatLng([result.lat, result.lon])
        } else {
          const marker = L.marker([result.lat, result.lon], { icon, draggable: true }).addTo(map)
          markerRef.current = marker

          marker.on('dragend', async () => {
            const pos = marker.getLatLng()
            const addr = await reverseGeocode(pos.lat, pos.lng)
            onChange(addr, String(pos.lat.toFixed(6)), String(pos.lng.toFixed(6)))
            setSearchText(addr)
          })
        }
      }
    } catch {
      setSearchError('Geocoding failed. Check your internet connection.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Address search bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSearch() } }}
          placeholder="Type an address and press Search…"
          style={{ flex: 1 }}
          id="location-address-search"
          disabled={!leafletReady}
        />
        <Button
          type="primary"
          icon={<Search size={14} />}
          loading={searching}
          onClick={() => void handleSearch()}
          disabled={!leafletReady}
        >
          Search
        </Button>
      </div>

      {searchError && (
        <p style={{ margin: 0, fontSize: 12, color: '#dc4c4c' }}>{searchError}</p>
      )}

      {/* Map container */}
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e7e9ee' }}>
        {!leafletReady && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#f6f7f9', zIndex: 10,
          }}>
            <Spin tip="Loading map…" />
          </div>
        )}
        <div ref={mapRef} style={{ height: 300, width: '100%' }} />
      </div>

      {/* Coordinate hint */}
      <p style={{ margin: 0, fontSize: 11, color: '#737987' }}>
        📍 Click on the map or drag the pin to set coordinates automatically.
        {latitude && longitude ? ` Current: ${latitude}, ${longitude}` : ''}
      </p>
    </div>
  )
}
