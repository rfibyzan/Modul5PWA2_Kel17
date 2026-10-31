/**
 * Contact section content (extracted from Contact.jsx page)
 */
export default function ContactSection() {
  return (
    <div className="profile-section">
      <h2 className="section-title">Kontak & Lokasi</h2>
      <p className="lede">
        Datangi toko kami atau hubungi melalui saluran berikut:
      </p>
      <div className="contact-info">
        <div className="contact-item">
          <strong>Alamat:</strong> 123 Range Road, Jakarta
        </div>
        <div className="contact-item">
          <strong>Jam Operasional:</strong> Selasa – Sabtu, 10:00 – 18:00
        </div>
        <div className="contact-item">
          <strong>Telepon:</strong> (021) 555-0100
        </div>
        <div className="contact-item">
          <strong>Email:</strong> hello@borebarrel.example
        </div>
      </div>
    </div>
  )
}