import styles from './styles.module.css';

export default function ImprintContent() {
  return (
    <section id="imprint" className={styles.imprintWrapper}>
      <h1>Imprint</h1>

      <div>
        <p>
          <strong>Contact Persons:</strong> Tanja Nicole Gruber, Araz Al Hamdani
        </p>

        <p>
          <strong>Address:</strong> FH Salzburg Urstein Süd 1, A-5412
          Puch/Salzburg, Austria
        </p>

        <p>
          <strong>Contact Information:</strong>
          <br />
          Email: tanjanicole.gruber@fh-salzburg.ac.at
        </p>

        <p>
          <strong>Applicable Legal Regulations: </strong>
          <a
            href="https://www.ris.bka.gv.at"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            www.ris.bka.gv.at
          </a>
        </p>

        <h4 className="text-lg font-semibold pt-6">Copyright</h4>
        <p>
          This website was created by students of the University of Applied
          Sciences Salzburg as part of the following master degreee programmes:
          MultiMediaTechnology Web & App Development, Realtime Art & Visual
          Effects and MultiMediaArts Audio.
        </p>
        <p>
          The contents of this website are, to the extent legally possible,
          protected by various rights (e.g. copyright). Any use or distribution
          of provided materials that is not permitted by copyright law requires
          written consent from the website operators.
        </p>

        <h4 className="text-lg font-semibold pt-6">Liability Disclaimer</h4>
        <p>
          Despite careful content control, the website operators assume no
          liability for the content of external links. The content of linked
          pages is the sole responsibility of their respective operators. If you
          notice any links to websites with illegal content or activity, please
          inform us so we can remove them immediately in accordance with § 17
          Abs. 2 ECG.
        </p>

        <p>
          Third-party copyrights are respected with the greatest care. If you
          still notice any copyright infringement, please notify us. Upon
          becoming aware of any legal violations, we will remove the affected
          content immediately.
        </p>
      </div>
    </section>
  );
}
