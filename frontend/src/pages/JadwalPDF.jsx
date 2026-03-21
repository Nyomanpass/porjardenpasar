import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const getBaganColor = (baganId) => {
  if (!baganId) return '#999999';
  const hue = (parseInt(baganId) * 137.5) % 360;
  return `hsl(${hue}, 70%, 45%)`;
};

const styles = StyleSheet.create({
  page: { padding: 25, backgroundColor: '#ffffff' },

  title: { fontSize: 14, marginBottom: 4, textAlign: 'center', fontWeight: 'bold' },
  subtitle: { fontSize: 9, marginBottom: 12, textAlign: 'center', color: '#666' },

  table: {
    width: '92%',
    marginHorizontal: '4%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },

  tableRow: { flexDirection: 'row' },

  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#eaeaea',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6
  },

  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,   // bikin kotak tinggi
    paddingHorizontal: 4,
    minHeight: 65          // cegah gepeng
  },

  tableCellHeader: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  tableCellPeserta: { fontSize: 8, textAlign: 'center', fontWeight: 'bold' },
  textVs: { fontSize: 7, color: '#666', marginVertical: 2 },

  baganLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginBottom: 3,
    borderRadius: 3,
    color: '#ffffff',
    textAlign: 'center'
  },

  timeCell: { backgroundColor: '#f2f2f2' },
  timeText: { fontSize: 9, fontWeight: 'bold' }
});

const JadwalPDF = ({ jadwal = [], lapanganList = [], selectedTanggal, tournamentName }) => {

  const sortedLapangan = [...lapanganList].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  const validJadwal = jadwal.filter(j => j.waktuMulai && j.lapangan?.nama);

  const allHours = [...new Set(validJadwal.map(j => j.waktuMulai.slice(11, 16)))].sort();

  // lebar kolom dinamis (jumlah lapangan + kolom jam)
  const colWidth = `${100 / (sortedLapangan.length + 1)}%`;

  return (
    <Document>
      <Page
        size="A4"
        orientation="landscape"
        style={styles.page}
        wrap={false}
      >
        <Text style={styles.title}>
          JADWAL PERTANDINGAN {tournamentName?.toUpperCase()}
        </Text>
        <Text style={styles.subtitle}>
          Tanggal: {selectedTanggal || 'Semua Tanggal'}
        </Text>

        {/* scale kecil supaya muat 1 halaman */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ transform: 'scale(0.95)', transformOrigin: 'top left' }}>
            <View style={styles.table}>

              {/* HEADER */}
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: colWidth }]}>
                  <Text style={styles.tableCellHeader}>JAM</Text>
                </View>

                {sortedLapangan.map(lap => (
                  <View key={lap} style={[styles.tableColHeader, { width: colWidth }]}>
                    <Text style={styles.tableCellHeader}>{lap.toUpperCase()}</Text>
                  </View>
                ))}
              </View>

              {/* BODY */}
              {allHours.map(jam => (
                <View key={jam} style={styles.tableRow}>
                  <View style={[styles.tableCol, styles.timeCell, { width: colWidth }]}>
                    <Text style={styles.timeText}>{jam}</Text>
                  </View>

                  {sortedLapangan.map(lapName => {
                    const matchData = validJadwal.find(j =>
                      j.waktuMulai.slice(11, 16) === jam &&
                      j.lapangan?.nama === lapName
                    );

                    const rawName = matchData?.match?.bagan?.nama || '';
                    const bName = rawName.replace(/BAGAN\s*\(.*?\)\s*/i, '');
                    const bId = matchData?.match?.bagan?.id || 0;
                    const bColor = getBaganColor(bId);

                    return (
                      <View key={lapName} style={[styles.tableCol, { width: colWidth }]}>
                        {matchData ? (
                          <>
                            <View style={[styles.baganLabel, { backgroundColor: bColor }]}>
                              <Text>{bName}</Text>
                            </View>

                            <Text style={styles.tableCellPeserta}>
                              {matchData.match?.doubleTeam1?.namaTim ||
                               matchData.match?.peserta1?.namaLengkap || 'TBA'}
                            </Text>

                            <Text style={styles.textVs}>vs</Text>

                            <Text style={styles.tableCellPeserta}>
                              {matchData.match?.doubleTeam2?.namaTim ||
                               matchData.match?.peserta2?.namaLengkap || 'TBA'}
                            </Text>
                          </>
                        ) : (
                          <Text style={{ fontSize: 8, color: '#ccc' }}>-</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default JadwalPDF;
